import { cacheKeys, defaultTransformers } from "@lilybird/transformers";
import { ApplicationCommandOptionType, InteractionType } from "lilybird";
import { ApplicationCommandHandler } from "./application-command.js";
import { join } from "node:path";

import type {
    Interaction as TransformedInteraction,
    ApplicationCommandData,
    DefaultTransformers
} from "@lilybird/transformers";

import type {
    ApplicationCommand,
    ClientListeners,
    ClientOptions,
    Transformers,
    Interaction,
    Awaitable,
    Client
} from "lilybird";

type ApplicationCommandJSONParams = ApplicationCommand.Create.ApplicationCommandJSONParams;

export interface HandlerOptions {
    cachePath: string;
    directoryPaths: {
        applicationCommands?: string,
        listeners?: string
    };
}

export const enum HandlerIdentifier {
    FRESH = "FRESH",
    CACHED = "CACHED",
    CHANGES = "CHANGES",
    LOADING = "LOADING",
    INVALID = "INVALID",
    COMPILED = "COMPILED"
}

type HandlerListener = (identifier: HandlerIdentifier, payload: unknown) => void;

export class Handler {
    // public readonly commands: Record<string, InteractionExecutor> = {};
    // public readonly autoComplete: Record<string, InteractionExecutor> = {};

    // readonly #commands: Array<ApplicationCommandJSONParams> = [];
    readonly #globalApplicationCommands: Array<ApplicationCommandHandler> = [];
    readonly #guildApplicationCommands: Array<ApplicationCommandHandler> = [];
    readonly #globMatcher = new Bun.Glob("**/{!.d,*}.{ts,tsx,js,jsx}");
    readonly #cachePath: string;
    readonly #paths: HandlerOptions["directoryPaths"];

    readonly #emit?: HandlerListener;

    public constructor({ cachePath, directoryPaths }: HandlerOptions, handlerListener?: HandlerListener) {
        this.#emit = handlerListener;
        this.#cachePath = cachePath;
        this.#paths = directoryPaths;
    }

    public async scanApplicationCommandDirectory(): Promise<boolean> {
        if (typeof this.#paths.applicationCommands === "undefined") return false;

        const files = this.#globMatcher.scan(this.#paths.applicationCommands);

        for await (const fileName of files) {
            const path = join(this.#paths.applicationCommands, fileName);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const maybeCommand: unknown = (await import(path)).default;
            if (typeof maybeCommand === "undefined" || typeof maybeCommand !== "function") {
                this.#emit?.(HandlerIdentifier.INVALID, path);
                continue;
            }

            const command = new (<new() => unknown>maybeCommand)();
            if (!(command instanceof ApplicationCommandHandler)) {
                this.#emit?.(HandlerIdentifier.INVALID, path);
                continue;
            }

            if (command.meta.isGuildOnly) this.#guildApplicationCommands.push(command);
            else this.#globalApplicationCommands.push(command);
        }

        // This way its easier to compile assuming there is always at least 1 element
        if (this.#globalApplicationCommands.length === 0 && this.#guildApplicationCommands.length === 0) return false;
        return true;
    }

    public async loadGlobalCommands(client: Client): Promise<void> {
        const file = Bun.file(join(this.#cachePath, "global.json"));
        const commands = this.#globalApplicationCommands.map((cmd) => cmd.toJSON());

        if (!await file.exists()) {
            this.#emit?.(HandlerIdentifier.FRESH, undefined);
            await Bun.write(file, JSON.stringify(commands));
            await client.rest.bulkOverwriteGlobalApplicationCommand(client.user.id, commands);
            return;
        }

        const cachedCommands = await file.json() as Array<ApplicationCommandJSONParams>;
        const toPublish: Array<ApplicationCommandJSONParams> = [];

        for (let i = 0, { length } = commands; i < length; i++) {
            const command = commands[i];
            const cachedIndex = cachedCommands.findIndex((c) => c.name === command.name);
            if (cachedIndex === -1) {
                toPublish.push(command);
                cachedCommands.push(command);
                continue;
            }

            if (!this.#differ(command, cachedCommands[cachedIndex])) continue;
            toPublish.push(command);
            cachedCommands[cachedIndex] = command;
        }

        if (toPublish.length < 1) {
            this.#emit?.(HandlerIdentifier.CACHED, undefined);
            return;
        }

        this.#emit?.(HandlerIdentifier.CHANGES, toPublish);
        // Using bulkOverwriteGlobalApplicationCommand with only a set of commands deletes the ones not included in that set
        // eslint-disable-next-line no-await-in-loop
        for (let i = 0, { length } = toPublish; i < length; i++) await client.rest.createGlobalApplicationCommand(client.user.id, toPublish[i]);
        await Bun.write(file, JSON.stringify(cachedCommands));
    }

    public async loadGuildCommands(client: Client): Promise<void> {
        const file = Bun.file(join(this.#cachePath, "guild.json"));
        const commands = this.#guildApplicationCommands.map((cmd) => cmd.toJSON());

        if (!await file.exists()) {
            this.#emit?.(HandlerIdentifier.FRESH, undefined);
            // eslint-disable-next-line curly
            for await (const command of this.#guildApplicationCommands) {
                for await (const id of command.meta.guildIds) await client.rest.createGuildApplicationCommand(client.user.id, id, command.toJSON());
            }

            await Bun.write(file, JSON.stringify(commands));
            return;
        }

        const cachedCommands = await file.json() as Array<ApplicationCommandJSONParams>;
        const toPublish: Array<ApplicationCommandHandler> = [];

        for (let i = 0, { length } = this.#guildApplicationCommands; i < length; i++) {
            const command = this.#guildApplicationCommands[i];
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const commandJSON = command.toJSON();
            const cachedIndex = cachedCommands.findIndex((c) => c.name === commandJSON.name);
            if (cachedIndex === -1) {
                toPublish.push(command);
                cachedCommands.push(commandJSON);
                continue;
            }

            if (!this.#differ(commandJSON, cachedCommands[cachedIndex])) continue;
            toPublish.push(command);
            cachedCommands[cachedIndex] = commandJSON;
        }

        if (toPublish.length < 1) {
            this.#emit?.(HandlerIdentifier.CACHED, undefined);
            return;
        }

        this.#emit?.(HandlerIdentifier.CHANGES, toPublish);

        // eslint-disable-next-line curly
        for await (const command of toPublish) {
            for await (const id of command.meta.guildIds) await client.rest.createGuildApplicationCommand(client.user.id, id, command.toJSON());
        }

        await Bun.write(file, JSON.stringify(cachedCommands));
    }

    protected async compileApplicationCommands(): Promise<((client: Client, interaction: Interaction.Structure) => Awaitable<unknown>) | null> {
        const loadedGlobalCommands = await this.scanApplicationCommandDirectory();
        if (!loadedGlobalCommands) return null;

        const commands = [...this.#globalApplicationCommands, ...this.#guildApplicationCommands];
        if (commands.length === 0) return null;

        const classes = new Map<string, ApplicationCommandHandler>();
        const functions = new Map<string, (interaction: TransformedInteraction<ApplicationCommandData>) => Awaitable<unknown>>();

        const cmdArr: Array<string> = [
            "const interaction_name = interaction.data.name;",
            `if (interaction.type === ${InteractionType.APPLICATION_COMMAND}) {`
        ];

        const autoArr: Array<string> = [`else if (interaction.type === ${InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE}) {`];

        for (let i = 0, { length } = commands; i < length; i++) {
            const command = commands[i];
            const temp: Array<string> = [
                `${i > 0 ? "else " : ""}if (interaction_name === "${command.toJSON().name}") {`,
                "const int = transformer(client, interaction);",
                "const sub_command = int.subCommand",
                "const sub_command_group = int.subCommandGroup"
            ];

            // eslint-disable-next-line no-underscore-dangle
            for (let j = 0, entries = [...command.__subs.entries()], len = entries.length; j < len; j++) {
                const [name, handler] = entries[j];
                functions.set(`sc${i}${j}`, handler);
                temp.push(`${j > 0 ? "else " : ""}if (sub_command === ${name}) { sc${i}${j}(int); }`);
            }

            // eslint-disable-next-line no-underscore-dangle
            for (let j = 0, entries = [...command.__groups.entries()], len = entries.length; j < len; j++) {
                const [name, sCommands] = entries[j];
                temp.push(`${j > 0 ? "else " : ""}if (sub_command_group === ${name}) {`);

                for (let k = 0, l = sCommands.length; k < l; k++) {
                    const [cName, handler] = sCommands[k];
                    functions.set(`scg${i}${j}${k}`, handler);
                    temp.push(`${j > 0 ? "else " : ""}if (sub_command === ${cName}) { scg${i}${j}${k}(int); }`);
                }

                temp.push("}");
            }

            if (temp.length === 4) {
                temp.pop();
                temp.pop();

                if ("execute" in command) {
                    classes.set(`ex${i}`, commands[i]);
                    cmdArr.push(temp.join(""), `ex${i}.execute(int);`, "}");
                }

                if ("autocomplete" in command) {
                    classes.set(`ac${i}`, commands[i]);
                    autoArr.push(temp.join(""), `ac${i}.autocomplete(int);`, "}");
                }
            } else {
                cmdArr.push(temp.join(""));
                autoArr.push(temp.join(""));
            }
        }

        const arr: Array<string> = [];
        if (cmdArr.length > 2) arr.push(cmdArr.join(""));
        if (autoArr.length > 1) {
            if (arr.length === 0) autoArr[0] = autoArr[0].slice(5);
            arr.push(autoArr.join(""));
        }

        const cNames = classes.keys();
        const cHandlers = classes.values();
        const fNames = functions.keys();
        const fHandlers = functions.values();
        const compiledListener = arr.join("");
        this.#emit?.(HandlerIdentifier.COMPILED, compiledListener);
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        return new Function(
            "transformer",
            ...cNames,
            ...fNames,
            `return async (client, interaction) => { ${compiledListener} }`
        )(
            defaultTransformers.interactionCreate.handler,
            ...cHandlers,
            ...fHandlers
        ) as never;
    }

    public async buildListeners(): Promise<ClientListeners<{}>> {
        const interactionListener = await this.compileApplicationCommands();
        const listeners: ClientListeners<Transformers> = {};

        if (interactionListener !== null) listeners.interactionCreate = interactionListener;

        return listeners;
    }

    #differOption(
        incoming: ApplicationCommand.OptionStructureWithoutNarrowing,
        cached: ApplicationCommand.OptionStructureWithoutNarrowing
    ): boolean {
        if (incoming.type !== cached.type) return true;

        const differentName = incoming.name !== cached.name;
        const differentDescription = incoming.description !== cached.description;
        const differentRequired = incoming.required !== cached.required;

        const base = differentName || differentDescription || differentRequired;

        switch (incoming.type) {
            case ApplicationCommandOptionType.SUB_COMMAND:
            case ApplicationCommandOptionType.SUB_COMMAND_GROUP: {
                if (incoming.options?.length !== cached.options?.length) return true;
                if (typeof incoming.options !== "undefined" && typeof cached.options !== "undefined") {
                    for (let i = 0, { length } = incoming.options; i < length; i++) {
                        const option = incoming.options[i];
                        const cachedIndex = cached.options.findIndex((op) => op.name === option.name);
                        if (cachedIndex === -1) return true;

                        if (!this.#differOption(option, cached.options[cachedIndex])) continue;
                        return true;
                    }
                }

                return base;
            }
            case ApplicationCommandOptionType.NUMBER:
            case ApplicationCommandOptionType.INTEGER: {
                const differentMinValue = incoming.min_value !== cached.min_value;
                const differentMaxValue = incoming.max_value !== cached.max_value;

                return base || differentMinValue || differentMaxValue;
            }
            case ApplicationCommandOptionType.STRING: {
                const differentMinLength = incoming.min_length !== cached.min_length;
                const differentMaxLength = incoming.max_length !== cached.max_length;

                return base || differentMinLength || differentMaxLength;
            }
            case ApplicationCommandOptionType.CHANNEL: {
                const differentChannelTypes = incoming.channel_types?.length !== cached.channel_types?.length;

                return base || differentChannelTypes;
            }
            case ApplicationCommandOptionType.BOOLEAN:
            case ApplicationCommandOptionType.USER:
            case ApplicationCommandOptionType.ROLE:
            case ApplicationCommandOptionType.MENTIONABLE:
            case ApplicationCommandOptionType.ATTACHMENT: {
                return base;
            }
        }
    }

    #differ(incoming: ApplicationCommandJSONParams, cached: ApplicationCommandJSONParams): boolean {
        if (incoming.options?.length !== cached.options?.length) return true;

        const differentName = incoming.name !== cached.name;
        const differentDescription = incoming.description !== cached.description;
        const differentDefaultPermissions = incoming.default_member_permissions !== cached.default_member_permissions;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const differentDMpermission = incoming.dm_permission !== cached.dm_permission;
        const differentType = incoming.type !== cached.type;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const differentNSFW = incoming.nsfw !== cached.nsfw;

        if (typeof incoming.options !== "undefined" && typeof cached.options !== "undefined") {
            for (let i = 0, { length } = incoming.options; i < length; i++) {
                const option = incoming.options[i];
                const cachedIndex = cached.options.findIndex((op) => op.name === option.name);
                if (cachedIndex === -1) return true;

                if (!this.#differOption(option, cached.options[cachedIndex])) continue;
                return true;
            }
        }

        return differentType
        || differentName
        || differentDescription
        || differentNSFW
        || differentDMpermission
        || differentDefaultPermissions;
    }
}

// eslint-disable-next-line @typescript-eslint/ban-types
type Expand<T> = T extends Function ? T : { [K in keyof T]: T[K] };

export async function createHandler(
    options: HandlerOptions & { setup?: ClientOptions<Omit<DefaultTransformers, "interactionCreate">>["setup"] },
    handlerListener?: HandlerListener
): Promise<Expand<Pick<Required<ClientOptions<Omit<DefaultTransformers, "interactionCreate">>>, "listeners" | "transformers" | "setup" | "customCacheKeys">>> {
    const handler = new Handler(options, handlerListener);

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { interactionCreate: _, ...transformers } = defaultTransformers;
    return {
        transformers,
        listeners: await handler.buildListeners(),
        customCacheKeys: cacheKeys,
        setup: async (client) => {
            await options.setup?.(client);
            await handler.loadGlobalCommands(client);
        }
    };
}

