
import { ApplicationCommandOptionType, InteractionType } from "lilybird";
import { defaultTransformers } from "@lilybird/transformers";

import type { ApplicationCommandData, AutocompleteData, Interaction as TransformedInteraction } from "@lilybird/transformers";
import type { Client, ApplicationCommand, Awaitable, Interaction } from "lilybird";

export type ApplicationCommandHandler = (interaction: TransformedInteraction<ApplicationCommandData>) => Awaitable<unknown>;
export type ApplicationAutocompleteHandler = (interaction: TransformedInteraction<AutocompleteData>) => Awaitable<unknown>;

interface CompiledCommand {
    body: { command: string, autocomplete: string | null };
    function: { names: Array<string>, handlers: Array<ApplicationCommandHandler | ApplicationAutocompleteHandler> };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    json: ApplicationCommand.Create.ApplicationCommandJSONParams & { __meta?: { ids?: string } };
}

type CommandStructure = Omit<ApplicationCommand.Create.ApplicationCommandJSONParams, "options">
    & {
        options?: Array<CommandOption>,
        meta?: CommandMeta,
        handle?: ApplicationCommandHandler,
        autocomplete?: ApplicationAutocompleteHandler
    };

type CommandOption = BaseCommandOption | SubCommandOption | SubCommandGroupOption;

type BaseCommandOption = Exclude<ApplicationCommand.Option.Structure, ApplicationCommand.Option.SubCommandStructure>;

interface SubCommandOption extends ApplicationCommand.Option.Base {
    type: ApplicationCommandOptionType.SUB_COMMAND;
    options?: Array<BaseCommandOption>;
    handle: ApplicationCommandHandler;
    autocomplete?: ApplicationAutocompleteHandler;
}

interface SubCommandGroupOption extends ApplicationCommand.Option.Base {
    type: ApplicationCommandOptionType.SUB_COMMAND_GROUP;
    options: Array<SubCommandOption>;
}

interface CommandMeta {
    guild_command?: boolean;
    ids?: Array<string>;
}

export const enum HandlerIdentifier {
    FRESH = "FRESH",
    CACHED = "CACHED",
    CHANGES = "CHANGES",
    LOADING = "LOADING",
    INVALID_PATH = "INVALID",
    INVALID_COMMAND = "INVALID_COMMAND",
    SKIPPING_HANDLER = "SIPPING_HANDLER",
    COMPILED = "COMPILED"
}

const enum HandleOptionsType {
    NORMAL,
    SUB
}

export type HandlerListener = (identifier: HandlerIdentifier, payload: unknown) => void;

export class ApplicationCommandStore {
    readonly #globalApplicationCommands = new Map<string, CompiledCommand>();
    readonly #guildApplicationCommands = new Map<string, CompiledCommand>();
    // readonly #globMatcher = new Bun.Glob("**/{!.d,*}.{ts,tsx,js,jsx}");

    readonly #emit?: HandlerListener;

    public constructor(handlerListener?: HandlerListener) {
        this.#emit = handlerListener;
    }

    public storeCommand(command: CommandStructure): void {
        const { meta, options, handle, autocomplete, ...actualCommand } = command;

        if (meta?.guild_command === true && !Array.isArray(meta.ids)) throw new Error("Invalid guild command. Lacking 'ids'");
        const commands = meta?.guild_command === true ? this.#guildApplicationCommands : this.#globalApplicationCommands;
        const isContinuingChain = (meta?.guild_command === true ? this.#guildApplicationCommands.size : this.#globalApplicationCommands.size) > 0;

        if (!Array.isArray(options) || options.length === 0) {
            if (typeof handle === "undefined") return this.#emit?.(HandlerIdentifier.INVALID_COMMAND, actualCommand.name);
            const cmd = this.#compileCommand(actualCommand, { base_executor: handle, auto_executor: autocomplete }, isContinuingChain, actualCommand.name);

            commands.set(actualCommand.name, cmd);
            return;
        }

        this.#emit?.(HandlerIdentifier.SKIPPING_HANDLER, actualCommand.name);
        const cmd = this.#compileCommand(actualCommand, options, isContinuingChain, actualCommand.name);

        commands.set(actualCommand.name, cmd);
    }

    #compileCommand(
        command: ApplicationCommand.Create.ApplicationCommandJSONParams,
        options: Required<CommandStructure>["options"] | { base_executor: ApplicationCommandHandler, auto_executor?: ApplicationAutocompleteHandler },
        useElse: boolean,
        // Used to keep track of sub command function naming
        name: string,
        matchTo: "interaction_name" | "sub_command" | "sub_command_group" = "interaction_name"
    ): CompiledCommand {
        if ("base_executor" in options) {
            const names = [`handle_${name.replace("-", "_")}`];
            const handlers: Array<(int: any) => unknown> = [options.base_executor];

            if (typeof options.auto_executor !== "undefined") {
                names.push(`auto_${name.replace("-", "_")}`);
                handlers.push(options.auto_executor);
            }

            return {
                body: {
                    command: `${useElse ? "else " : ""}if (${matchTo} === "${command.name}") { handle_${name.replace("-", "_")}(${
                        matchTo === "interaction_name" ? "transformer(client, interaction)" : "int"
                    }); }`,
                    autocomplete: typeof options.auto_executor === "undefined"
                        ? null
                        : `${useElse ? "else " : ""}if (${matchTo} === "${command.name}") { auto_${name.replace("-", "_")}(${
                            matchTo === "interaction_name" ? "transformer(client, interaction)" : "int"
                        }); }`
                },
                function: {
                    names,
                    handlers
                },
                json: command
            };
        }

        const fns = new Map<string, ApplicationCommandHandler | ApplicationAutocompleteHandler>();
        const cmdArr: Array<string> = [`${useElse ? "else " : ""}if (${matchTo} === "${command.name}") {`];
        const autoArr: Array<string> = [`${useElse ? "else " : ""}if (${matchTo} === "${command.name}") {`];
        const compileStrategy = this.#getHandleOptionType(options);
        if (compileStrategy === HandleOptionsType.NORMAL) throw new Error("Not supported yet");

        const temp: Array<string> = matchTo === "sub_command_group"
            ? []
            : [
                "const int = transformer(client, interaction);",
                "const sub_command = int.subCommand;",
                "const sub_command_group = int.subCommandGroup;"
            ];

        cmdArr.push(temp.join(""));
        autoArr.push(temp.join(""));

        for (let i = 0, { length } = options; i < length; i++) {
            const subCommand = options[i];
            if (subCommand.type === ApplicationCommandOptionType.SUB_COMMAND_GROUP) {
                if (!("options" in subCommand)) throw new Error("SubCommandGroup requires options to exist");
                const { options: subOpts, ...realCommand } = subCommand;
                const realOptions = this.#compileCommand(<never>realCommand, subOpts, i > 0, `${name}_${subCommand.name}`, "sub_command_group");

                if (!Array.isArray(command.options)) command.options = [];

                cmdArr.push(realOptions.body.command);
                if (realOptions.body.autocomplete !== null) autoArr.push(realOptions.body.autocomplete);
                for (let j = 0, len = realOptions.function.names.length; j < len; j++) {
                    const n = realOptions.function.names[j];
                    const h = realOptions.function.handlers[j];

                    fns.set(n, h);
                }

                command.options.push(realCommand);
            } else if (subCommand.type === ApplicationCommandOptionType.SUB_COMMAND) {
                if (!("handle" in subCommand)) throw new Error("SubCommand requires 'handle' to exist");

                const { handle, autocomplete, ...realCommand } = subCommand;
                const cmd = this.#compileCommand(<never>realCommand, { base_executor: handle, auto_executor: autocomplete }, i > 0, `${name}_${subCommand.name}`, "sub_command");

                if (!Array.isArray(command.options)) command.options = [];

                cmdArr.push(cmd.body.command);
                if (cmd.body.autocomplete !== null) autoArr.push(cmd.body.autocomplete);
                for (let j = 0, len = cmd.function.names.length; j < len; j++) {
                    const n = cmd.function.names[j];
                    const h = cmd.function.handlers[j];

                    fns.set(n, h);
                }

                command.options.push(realCommand);
            }
        }

        cmdArr.push("}");
        autoArr.push("}");
        return {
            body: { command: cmdArr.join(""), autocomplete: autoArr.length > 4 ? autoArr.join("") : null },
            function: { names: [...fns.keys()], handlers: [...fns.values()] },
            json: command
        };
    }

    #getHandleOptionType(options: Required<CommandStructure>["options"]): HandleOptionsType {
        for (let i = 0, { length } = options; i < length; i++) {
            const { type } = options[i];
            if (type === ApplicationCommandOptionType.SUB_COMMAND_GROUP
                || type === ApplicationCommandOptionType.SUB_COMMAND) return HandleOptionsType.SUB;
        }

        return HandleOptionsType.NORMAL;
    }

    // TODO: public async scanDir(): Promise<void> {}
    public compile(): ((client: Client, interaction: Interaction.Structure) => Awaitable<unknown>) | null {
        const functions = new Map<string, ApplicationCommandHandler | ApplicationAutocompleteHandler>();
        const cmdArr: Array<string> = [
            "const interaction_name = interaction.data.name;",
            `if (interaction.type === ${InteractionType.APPLICATION_COMMAND}) {`
        ];

        const autoArr: Array<string> = [`else if (interaction.type === ${InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE}) {`];
        const commands = [...this.#globalApplicationCommands.values(), ...this.#guildApplicationCommands.values()];

        for (let i = 0, { length } = commands; i < length; i++) {
            const { body, function: fn } = commands[i];
            cmdArr.push(body.command);
            if (body.autocomplete !== null) autoArr.push(body.autocomplete);
            for (let j = 0, len = fn.names.length; j < len; j++) {
                const n = fn.names[j];
                const h = fn.handlers[j];

                functions.set(n, h);
            }
        }

        const arr: Array<string> = [];
        if (cmdArr.length > 2) arr.push(cmdArr.join(""));
        if (autoArr.length > 1) {
            if (arr.length === 0) autoArr[0] = autoArr[0].slice(5);
            arr.push(autoArr.join(""));
            arr.push("}");
        }

        if (arr.length === 0) return null;
        arr.push("}");

        const fNames = functions.keys();
        const fHandlers = functions.values();
        const compiledListener = arr.join("");
        console.log(compiledListener, "\n", fNames, "\n", fHandlers);
        this.#emit?.(HandlerIdentifier.COMPILED, compiledListener);

        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        return new Function(
            "transformer",
            ...fNames,
            `return async (client, interaction) => { ${compiledListener} }`
        )(
            defaultTransformers.interactionCreate.handler,
            ...fHandlers
        ) as never;
    }

    public getGlobalCommands(): Array<CompiledCommand> {
        return [...this.#globalApplicationCommands.values()];
    }

    public getGuildCommands(): Array<CompiledCommand> {
        return [...this.#guildApplicationCommands.values()];
    }
}

export const CommandStore = new ApplicationCommandStore();
