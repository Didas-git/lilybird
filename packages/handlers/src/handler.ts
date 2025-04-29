import { ApplicationCommandStore, innerOptionParser } from "./application-command-store.js";
import { MessageComponentStore } from "./message-component-store.js";
import { ApplicationCommandOptionType } from "lilybird";
import { HandlerIdentifier } from "./shared.js";
import { join } from "node:path";

import type { ComponentStructure, DynamicComponentStructure } from "./message-component-store.js";
import type { HandlerListener } from "./shared.js";
import type {
    ApplicationCommandStoreCustomKeys,
    ApplicationCommandStoreOptions,
    SubCommandStructure,
    BaseCommandOption,
    CommandStructure,
    CommandOption
} from "./application-command-store.js";

import type {
    ApplicationCommand,
    Transformers,
    Interaction,
    Awaitable,
    Listeners,
    Client
} from "lilybird";

type ApplicationCommandJSONParams = ApplicationCommand.Create.ApplicationCommandJSONParams;

// TODO: Publish guild commands
export class Handler<T extends Transformers<Client> = Transformers<Client>, U extends boolean = false> {
    readonly #acs = new ApplicationCommandStore<U>();
    readonly #mcs = new MessageComponentStore();
    readonly #listeners = new Map<string, (...args: Array<any>) => any>();
    readonly #customKeys?: ApplicationCommandStoreCustomKeys;

    #emit?: HandlerListener;
    #cachePath?: string;

    public constructor(options: {
        cachePath?: string,
        enableDynamicComponents?: boolean,
        acsOptions?: ApplicationCommandStoreOptions,
        handlerListener?: HandlerListener
    }) {
        this.#cachePath = options.cachePath;
        this.#emit = options.handlerListener;

        if (options.enableDynamicComponents) this.#mcs = new MessageComponentStore(options.handlerListener, options.enableDynamicComponents);
        if (typeof options.acsOptions !== "undefined") {
            this.#customKeys = options.acsOptions.customKeys;
            this.#acs = new ApplicationCommandStore<U>(options.handlerListener, options.acsOptions);
        }
    }

    public buttonCollector(component: DynamicComponentStructure): void {
        this.#mcs.addDynamicComponent(component);
    }

    public storeCommand<const O extends Array<CommandOption>>(data: CommandStructure<O, U> & { components?: Array<ComponentStructure> }): void {
        const { components, ...command } = data;
        if (typeof components !== "undefined")
            for (let i = 0, { length } = components; i < length; i++) this.#mcs.storeComponent(components[i]);
        this.#acs.storeCommand(command);
    }

    public subCommandMock<const O extends Array<BaseCommandOption>>(data: SubCommandStructure<O, U>): SubCommandStructure<O, U> { return data; }

    public storeListener<
        TR extends Transformers<Client> = T,
        K extends keyof TR = keyof TR
    >(data: { event: K, handle: Required<Listeners<Client, TR>>[K] }): void {
        this.#listeners.set(<never>data.event, <never>data.handle);
    }

    public clearStores(): void {
        this.#acs.clear();
        this.#mcs.clear();
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

    // TODO: Account for custom keys
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
            if (realStack.length > 2) realStack.push("else ");
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

    public compileCommands(): ((...args: T["interactionCreate"] extends Transformer ? Parameters<T["interactionCreate"]["handler"]> : never) => Awaitable<unknown>) | null {
        const compiledResult = this.getCompilationStack();
        if (compiledResult === null) return null;

        const { stack, functionNames, handlers } = compiledResult;
        this.#emit?.(HandlerIdentifier.COMPILED, stack);

        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        return new Function(
            "parseOpts",
            ...functionNames,
            typeof this.#customKeys !== "undefined" ? `return async (interaction) => { ${stack} }` : `return async (client, interaction) => { ${stack} }`
        )(
            innerOptionParser,
            ...handlers
        ) as never;
    }

    public getListenersObject(includeCommands: boolean = true): Listeners<Client, T> {
        const obj: Record<string, unknown> = {};

        for (let i = 0, entries = [...this.#listeners.entries()], { length } = entries; i < length; i++) {
            const [key, value] = entries[i];
            obj[key] = value;
        }

        if (includeCommands) {
            const listener = this.compileCommands();
            if (listener === null) return obj as never;
            if ("interactionCreate" in obj) {
                obj.interactionCreate = typeof this.#customKeys !== "undefined"
                    ? (interaction: any) => {
                    // @ts-expect-error The obj constant is not typed
                        obj.interactionCreate(interaction);
                        // @ts-expect-error This is intended behavior due to the dynamic nature of this function
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        listener(interaction);
                    }
                    : (client: Client, interaction: Interaction.Structure) => {
                    // @ts-expect-error The obj constant is not typed
                        obj.interactionCreate(client, interaction);
                        // @ts-expect-error This is intended behavior due to the dynamic nature of this function
                        listener(client, interaction);
                    };
            } else obj.interactionCreate = listener;
        }

        return obj as never;
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
            this.#emit?.(HandlerIdentifier.FRESH, undefined);
            await Bun.write(file, JSON.stringify(commandsJSON));
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
            this.#emit?.(HandlerIdentifier.CACHED, undefined);
            return;
        }

        this.#emit?.(HandlerIdentifier.CHANGES, toPublish);
        // Using bulkOverwriteGlobalApplicationCommand with only a set of commands deletes the ones not included in that set
        // eslint-disable-next-line no-await-in-loop
        for (let i = 0, { length } = toPublish; i < length; i++) await client.rest.createGlobalApplicationCommand(client.user.id, toPublish[i]);
        await Bun.write(file, JSON.stringify(cachedCommands));
    }

    public getStoredData(): {
        commands: {
            global: ReturnType<ApplicationCommandStore<U>["getStoredGlobalCommands"]>,
            guild: ReturnType<ApplicationCommandStore<U>["getStoredGuildCommands"]>
        },
        components: ReturnType<MessageComponentStore["getStoredComponents"]>,
        listeners: Array<[name: string, handle: (...args: Array<any>) => any]>
    } {
        return {
            commands: {
                global: this.#acs.getStoredGlobalCommands(),
                guild: this.#acs.getStoredGuildCommands()
            },
            components: this.#mcs.getStoredComponents(),
            listeners: [...this.#listeners.entries()]
        };
    }

    public addDebugListener(listener: HandlerListener): void {
        this.#emit = listener;
    }

    public set cachePath(path: string) {
        this.#cachePath = path;
    }

    public get cachePath(): string | undefined {
        return this.#cachePath;
    }

    public set enableDynamicComponents(bool: boolean) {
        this.#mcs.attachDynamicComponentListener = bool;
    }

    public get enableDynamicComponents(): boolean {
        return this.#mcs.attachDynamicComponentListener;
    }
}

export const handler = new Handler({});
export const $applicationCommand = handler.storeCommand.bind(handler);
export const $subCommand = handler.subCommandMock.bind(handler);
export const $listener = handler.storeListener.bind(handler);
export const $component = handler.buttonCollector.bind(handler);
