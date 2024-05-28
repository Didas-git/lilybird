import { ApplicationCommandStore } from "./application-command-store.js";
import { MessageComponentStore } from "./message-component-store.js";
import { defaultTransformers } from "@lilybird/transformers";
import { ApplicationCommandOptionType } from "lilybird";
import { HandlerIdentifier } from "./shared.js";
import { join } from "node:path";

import type { ApplicationCommand, Awaitable, Client, Interaction } from "lilybird";
import type { CommandStructure } from "./application-command-store.js";
import type { ComponentStructure } from "./message-component-store.js";
import type { HandlerListener } from "./shared.js";

type ApplicationCommandJSONParams = ApplicationCommand.Create.ApplicationCommandJSONParams;

export class Handler {
    readonly #acs = new ApplicationCommandStore();
    readonly #mcs = new MessageComponentStore();
    readonly #globMatcher = new Bun.Glob("**/*.{!d,ts,js,tsx,jsx}");

    #emit?: HandlerListener;
    #cachePath: string | null = null;

    public constructor(handlerListener?: HandlerListener) {
        this.#emit = handlerListener;
    }

    public async scanDir(path: string): Promise<void> {
        const files = this.#globMatcher.scan(path);
        for await (const fileName of files) await import(join(path, fileName));
    }

    public store(data: CommandStructure & { components?: Array<ComponentStructure> }): void {
        const { components, ...command } = data;
        if (typeof components !== "undefined")
            for (let i = 0, { length } = components; i < length; i++) this.#mcs.storeComponent(components[i]);
        this.#acs.storeCommand(command);
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

    #getStackBody(commandsBody: string, componentsBody: string): string {
        const realStack: Array<string> = [];
        if (commandsBody.length > 0) realStack.push("const interaction_name = interaction.data.name;");
        if (componentsBody.length > 0) realStack.push("const custom_id = interaction.data.custom_id;");
        // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
        if (commandsBody.length > 0 && commandsBody[0] === "c") {
            const trimLength = "const interaction_name = interaction.data.name;".length;
            realStack.push(commandsBody.slice(trimLength));
        }

        // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
        if (componentsBody.length > 0 && componentsBody[0] === "c") {
            const trimLength = "const custom_id = interaction.data.custom_id;".length;
            if (realStack.length < 1) realStack.push("else ");
            realStack.push(componentsBody.slice(trimLength));
        }

        return realStack.join("");
    }

    public getCompilationStack(): {
        functionNames: Array<string>,
        handlers: Array<(...args: any) => any>,
        stack: string
    } | null {
        const maybeAcs = this.#acs.getCompilationStack();
        const acs = maybeAcs ?? { functionNames: [], handlers: [], stack: "" };
        const maybeMcs = this.#mcs.getCompilationStack();
        const mcs = maybeMcs ?? { functionNames: [], handlers: [], stack: "" };

        const body = this.#getStackBody(acs.stack, mcs.stack);
        if (body.length === 0) return null;

        return {
            functionNames: [...acs.functionNames, ...mcs.functionNames],
            handlers: [...acs.handlers, ...mcs.handlers],
            stack: body
        };
    }

    public compile(): ((client: Client, interaction: Interaction.Structure) => Awaitable<unknown>) | null {
        const compiledResult = this.getCompilationStack();
        if (compiledResult === null) return null;

        const { stack, functionNames, handlers } = compiledResult;
        this.#emit?.(HandlerIdentifier.COMPILED, stack);

        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        return new Function(
            "transformer",
            ...functionNames,
            `return async (client, interaction) => { ${stack} }`
        )(
            defaultTransformers.interactionCreate.handler,
            ...handlers
        ) as never;
    }

    public async loadGlobalCommands(client: Client): Promise<void> {
        const path = join(this.#cachePath ?? process.cwd(), "global.json");
        const file = Bun.file(path);

        const commands = this.#acs.getStoredGlobalCommands();
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const commandsJSON = commands.map((cmd) => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const { __meta, ...obj } = cmd.json;
            return obj;
        });

        if (!await file.exists()) {
            console.log("Publish all commands & creating cache");
            await Bun.write(file, JSON.stringify(commands));
            await client.rest.bulkOverwriteGlobalApplicationCommand(client.user.id, commandsJSON);
            return;
        }

        const cachedCommands = await file.json() as Array<ApplicationCommandJSONParams>;
        const toPublish: Array<ApplicationCommandJSONParams> = [];

        for (let i = 0, { length } = commands; i < length; i++) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const { __meta, ...command } = commands[i].json;
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
            console.log("All commands were cached, nothing to update");
            return;
        }

        console.log("Publishing changed commands", toPublish);
        // Using bulkOverwriteGlobalApplicationCommand with only a set of commands deletes the ones not included in that set
        // eslint-disable-next-line no-await-in-loop
        for (let i = 0, { length } = toPublish; i < length; i++) await client.rest.createGlobalApplicationCommand(client.user.id, toPublish[i]);
        await Bun.write(file, JSON.stringify(cachedCommands));
    }

    public getStoredData(): {
        commands: {
            global: ReturnType<ApplicationCommandStore["getStoredGlobalCommands"]>,
            guild: ReturnType<ApplicationCommandStore["getStoredGuildCommands"]>
        },
        components: ReturnType<MessageComponentStore["getStoredComponents"]>
    } {
        return {
            commands: {
                global: this.#acs.getStoredGlobalCommands(),
                guild: this.#acs.getStoredGuildCommands()
            },
            components: this.#mcs.getStoredComponents()
        };
    }

    public addDebugListener(listener: HandlerListener): void {
        this.#emit = listener;
    }

    public set cachePath(path: string) {
        this.#cachePath = path;
    }

    public get cachePath(): string | null {
        return this.#cachePath;
    }
}

export const handler = new Handler();
export const $applicationCommand = handler.store.bind(handler);

