import { ApplicationCommandOptionType, InteractionType } from "lilybird";
import { HandlerIdentifier } from "./shared.js";

import type { Client, ApplicationCommand, Awaitable, Interaction } from "lilybird";
import type { HandlerListener } from "./shared.js";

import type {
    Interaction as TransformedInteraction,
    ApplicationCommandData,
    AutocompleteData
} from "@lilybird/transformers";

type Expand<T> = T extends T ? { [K in keyof T]: T[K] } : never;
type U2I<U> = (U extends U ? (u: U) => 0 : never) extends (i: infer I) => 0 ? Extract<I, U> : never;

type ParseOption<O extends BaseCommandOption> = O["required"] extends true
    ? { -readonly [K in keyof O as K extends "name" ? O[K] : never]: MapOptionType<O["type"]> }
    : { -readonly [K in keyof O as K extends "name" ? O[K] : never]: MapOptionType<O["type"]> | undefined };

type ParseOptions<O extends Array<CommandOption>> = U2I<{
    [K in keyof O]: O[K] extends BaseCommandOption ? ParseOption<O[K]> : never
}[number]>;

type MapOptionType<T extends ApplicationCommandOptionType> = T extends ApplicationCommandOptionType.INTEGER | ApplicationCommandOptionType.NUMBER ? number
    : T extends ApplicationCommandOptionType.BOOLEAN ? boolean : string;

export type ApplicationCommandHandler<O extends Array<CommandOption>, U extends boolean> = U extends true
    ? (interaction: TransformedInteraction<ApplicationCommandData>) => Awaitable<unknown>
    : (interaction: Interaction.ApplicationCommandInteractionStructure, options: Expand<ParseOptions<O>>) => Awaitable<unknown>;

export type ApplicationAutocompleteHandler<O extends Array<CommandOption>, U extends boolean> = U extends true
    ? (interaction: TransformedInteraction<AutocompleteData>) => Awaitable<unknown>
    : (interaction: Interaction.ApplicationCommandInteractionStructure, options: Expand<ParseOptions<O>>) => Awaitable<unknown>;

interface CompiledCommand {
    body: { command: string, autocomplete: string | null };
    function: { names: Array<string>, handlers: Array<ApplicationCommandHandler<Array<CommandOption>, boolean> | ApplicationAutocompleteHandler<Array<CommandOption>, boolean>> };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    json: ApplicationCommand.Create.ApplicationCommandJSONParams & { __meta?: { ids?: string } };
}

export interface CommandStructure<O extends Array<CommandOption>, U extends boolean> extends Omit<ApplicationCommand.Create.ApplicationCommandJSONParams, "options"> {
    options?: O;
    meta?: CommandMeta;
    handle?: ApplicationCommandHandler<O, U>;
    autocomplete?: ApplicationAutocompleteHandler<O, U>;
}

export type CommandOption = BaseCommandOption | SubCommandStructure<Array<BaseCommandOption>, boolean> | SubCommandGroupOption;

export type BaseCommandOption = Exclude<ApplicationCommand.Option.Structure, ApplicationCommand.Option.SubCommandStructure>;

export interface SubCommandStructure<O extends Array<BaseCommandOption>, U extends boolean> extends ApplicationCommand.Option.Base {
    type: ApplicationCommandOptionType.SUB_COMMAND;
    options?: O;
    handle: ApplicationCommandHandler<O, U>;
    autocomplete?: ApplicationAutocompleteHandler<O, U>;
}

interface SubCommandGroupOption extends ApplicationCommand.Option.Base {
    type: ApplicationCommandOptionType.SUB_COMMAND_GROUP;
    options: Array<SubCommandStructure<Array<BaseCommandOption>, boolean>>;
}

interface CommandMeta {
    guild_command?: boolean;
    ids?: Array<string>;
}

export class ApplicationCommandStore<U extends boolean> {
    readonly #globalApplicationCommands = new Map<string, CompiledCommand>();
    readonly #guildApplicationCommands = new Map<string, CompiledCommand>();

    readonly #emit?: HandlerListener;

    readonly #transformer: ((interaction: Interaction.Structure) => Awaitable<unknown>) | undefined;

    public constructor(handlerListener?: HandlerListener, transformer?: (interaction: Interaction.Structure) => Awaitable<unknown>) {
        this.#emit = handlerListener;
        this.#transformer = transformer;
    }

    public storeCommand<const O extends Array<CommandOption>>(command: CommandStructure<O, U>): void {
        const { meta, options, handle, autocomplete, ...actualCommand } = command;

        if (meta?.guild_command === true && !Array.isArray(meta.ids)) throw new Error("Invalid guild command. Lacking 'ids'");
        const commands = meta?.guild_command === true ? this.#guildApplicationCommands : this.#globalApplicationCommands;
        const isContinuingChain = (meta?.guild_command === true ? this.#guildApplicationCommands.size : this.#globalApplicationCommands.size) > 0;

        // eslint-disable-next-line @stylistic/no-extra-parens
        if ((!Array.isArray(options) || options.length === 0) || (typeof options !== "undefined" && !this.#isCommandWrapper(options))) {
            if (typeof handle === "undefined") return this.#emit?.(HandlerIdentifier.INVALID_COMMAND, actualCommand.name);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (<any>actualCommand).options = options;

            const optsBody = this.#parseOptions(options);
            const cmd = this.#makeCommandBase(actualCommand, { base_executor: <never>handle, auto_executor: <never>autocomplete }, isContinuingChain, optsBody);
            commands.set(actualCommand.name, cmd);
            return;
        }

        if (typeof handle !== "undefined") this.#emit?.(HandlerIdentifier.SKIPPING_HANDLER, actualCommand.name);
        const optsBody = this.#parseOptions(options, true);
        if (typeof optsBody === "undefined") throw new Error("Something unexpected happened!");
        const cmd = this.#compileCommand(actualCommand, options, isContinuingChain, optsBody);
        commands.set(actualCommand.name, cmd);
        return;
    }

    #parseOptions(options: Array<CommandOption> | undefined, appendSubCommandLogic: boolean = false): string | undefined {
        if (typeof options === "undefined") return undefined;
        const stack: Array<string> = ["const _obj = {"];

        for (let i = 0, { length } = options; i < length; i++) {
            const option = options[i];
            stack.push(`${option.name}: undefined`);
        }

        stack.push("};");

        if (appendSubCommandLogic) {
            stack.push(
                "const _opt = interaction.data.options[0];",
                "if ( _opt.type === 2) {",
                "sub_command_group = _opt.name;",
                "for (let i = 0, { length } = _opt.options; i < length; i++) {",
                "const _g_opt = _opt.options[i];",
                "if (_g_opt.type === 1) {sub_command = _g_opt.name; parseOpts(_g_opt.options, _obj)}",
                "}",
                "}",
                "else if (_opt.type === 1) {sub_command = _opt.name; parseOpts(_opt.options, _obj)}"
            );
        } else stack.push("parseOpts(interaction.data.options, _obj);");

        return stack.join("");
    }

    #makeCommandBase(
        command: ApplicationCommand.Create.ApplicationCommandJSONParams,
        handler: { base_executor: ApplicationCommandHandler<Array<CommandOption>, U>, auto_executor?: ApplicationAutocompleteHandler<Array<CommandOption>, boolean> },
        useElse: boolean,
        optionsBody: string | undefined = undefined,
        matchTo: "interaction_name" | "sub_command" = "interaction_name",
        name: string = command.name
    ): CompiledCommand {
        const useTransformer = typeof this.#transformer !== "undefined";
        const hasOptions = typeof optionsBody !== "undefined";
        const names = [`handle_${name.replace("-", "_")}`];
        const handlers: Array<(...args: any) => any> = [handler.base_executor];

        if (typeof handler.auto_executor !== "undefined") {
            names.push(`auto_${name.replace("-", "_")}`);
            handlers.push(handler.auto_executor);
        }

        let strArgs = useTransformer ? "transformer(client, interaction)" : "interaction";
        if (hasOptions) strArgs += ", _obj";

        return {
            body: {
                command: `${useElse ? "else " : ""}if (${matchTo} === "${command.name}") {
    ${hasOptions ? optionsBody : ""}
    return handle_${name.replace("-", "_")}(${strArgs}); }`,
                autocomplete: typeof handler.auto_executor === "undefined"
                    ? null
                    : `${useElse ? "else " : ""}if (${matchTo} === "${command.name}") { 
    ${hasOptions ? optionsBody : ""}
    return auto_${name.replace("-", "_")}(${strArgs}}); }`
            },
            function: {
                names,
                handlers
            },
            json: command
        };
    }

    #compileCommand(
        command: ApplicationCommand.Create.ApplicationCommandJSONParams,
        options: Required<CommandStructure<Array<CommandOption>, U>>["options"],
        useElse: boolean,
        optionsBody: string,
        matchTo: "sub_command" | "sub_command_group" = "sub_command",
        name: string = command.name
    ): CompiledCommand {
        const useTransformer = typeof this.#transformer !== "undefined";
        const fns = new Map<string, ApplicationCommandHandler<Array<CommandOption>, U> | ApplicationAutocompleteHandler<Array<CommandOption>, U>>();
        const cmdArr: Array<string> = [`${useElse ? "else " : ""}if (${matchTo} === "${command.name}") {`];
        const autoArr: Array<string> = [`${useElse ? "else " : ""}if (${matchTo} === "${command.name}") {`];

        const temp: Array<string> = matchTo === "sub_command_group"
            ? []
            : useTransformer
                ? [
                    "const int = transformer(client, interaction);",
                    "const sub_command = int.data.subCommand;",
                    "const sub_command_group = int.data.subCommandGroup;"
                ]
                : [
                    "let sub_command = undefined;",
                    "let sub_command_group = undefined;",
                    optionsBody
                ];

        cmdArr.push(temp.join(""));
        autoArr.push(temp.join(""));

        for (let i = 0, { length } = options; i < length; i++) {
            const subCommand = options[i];
            if (subCommand.type === ApplicationCommandOptionType.SUB_COMMAND_GROUP) {
                if (!("options" in subCommand)) throw new Error("SubCommandGroup requires options to exist");
                const { options: subOpts, ...realCommand } = subCommand;
                const realOptions = this.#compileCommand(<never>realCommand, <never>subOpts, i > 0, `${name}_${subCommand.name}`, "sub_command_group");

                cmdArr.push(realOptions.body.command);
                if (realOptions.body.autocomplete !== null) autoArr.push(realOptions.body.autocomplete);
                for (let j = 0, len = realOptions.function.names.length; j < len; j++) {
                    const n = realOptions.function.names[j];
                    const h = realOptions.function.handlers[j];

                    fns.set(n, <never>h);
                }

                if (!Array.isArray(command.options)) command.options = [];
                command.options.push(realCommand);
            } else if (subCommand.type === ApplicationCommandOptionType.SUB_COMMAND) {
                if (!("handle" in subCommand)) throw new Error("SubCommand requires 'handle' to exist");

                const { handle, autocomplete, ...realCommand } = <SubCommandStructure<Array<CommandOption>, U>>subCommand;
                const cmd = this.#makeCommandBase(<never>realCommand, { base_executor: handle, auto_executor: autocomplete }, i > 0, "", "sub_command", `${name}_${subCommand.name}`);

                cmdArr.push(cmd.body.command);
                if (cmd.body.autocomplete !== null) autoArr.push(cmd.body.autocomplete);
                for (let j = 0, len = cmd.function.names.length; j < len; j++) {
                    const n = cmd.function.names[j];
                    const h = cmd.function.handlers[j];

                    fns.set(n, <never>h);
                }

                if (!Array.isArray(command.options)) command.options = [];
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

    #isCommandWrapper(options: Required<CommandStructure<Array<CommandOption>, U>>["options"]): boolean {
        for (let i = 0, { length } = options; i < length; i++) {
            const { type } = options[i];
            if (type === ApplicationCommandOptionType.SUB_COMMAND_GROUP
                || type === ApplicationCommandOptionType.SUB_COMMAND) return true;
        }

        return false;
    }

    public getCompilationStack(): {
        functionNames: IterableIterator<string>,
        handlers: IterableIterator<(...args: any) => any>,
        stack: string
    } | null {
        const functions = new Map<string, ApplicationCommandHandler<Array<CommandOption>, U> | ApplicationAutocompleteHandler<Array<CommandOption>, U>>();
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

                functions.set(n, <never>h);
            }
        }

        const arr: Array<string> = [];
        if (cmdArr.length > 2) arr.push(cmdArr.join(""), "}");
        if (autoArr.length > 1) {
            if (arr.length === 0) autoArr[0] = autoArr[0].slice(5);
            // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
            if (autoArr[1][0] === "e") autoArr[1] = autoArr[1].slice(5);
            arr.push(autoArr.join(""), "}");
        }

        if (arr.length === 0) return null;

        const fNames = functions.keys();
        const fHandlers = functions.values();
        const compiledListener = arr.join("");

        return {
            functionNames: fNames,
            handlers: fHandlers,
            stack: compiledListener
        };
    }

    public compile(): ((client: Client, interaction: Interaction.Structure) => Awaitable<unknown>) | null {
        const compiledResult = this.getCompilationStack();
        if (compiledResult === null) return null;

        const { stack, functionNames, handlers } = compiledResult;
        this.#emit?.(HandlerIdentifier.COMPILED, stack);

        function optionParser(options: ApplicationCommand.DataStructure["options"], _obj: Record<string, unknown>): void {
            if (!options) return;
            for (let i = 0, { length } = options; i < length; i++) {
                const opt = options[i];
                _obj[opt.name] = opt.value;
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        return new Function(
            "transformer",
            "parseOpts",
            ...functionNames,
            `return async (client, interaction) => { ${stack} }`
        )(
            this.#transformer,
            optionParser,
            ...handlers
        ) as never;
    }

    public getStoredGlobalCommands(): Array<CompiledCommand> {
        return [...this.#globalApplicationCommands.values()];
    }

    public getStoredGuildCommands(): Array<CompiledCommand> {
        return [...this.#guildApplicationCommands.values()];
    }

    public clear(): void {
        this.#globalApplicationCommands.clear();
        this.#guildApplicationCommands.clear();
    }
}
