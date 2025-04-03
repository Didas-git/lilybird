import { ApplicationCommandOptionType, ApplicationCommandType } from "lilybird";

import type { ApplicationCommand, Localizations, PermissionFlags } from "lilybird";

export class ApplicationCommandBuilder {
    readonly #command: ApplicationCommand.Create.ApplicationCommandJSONParams = <never>{};

    public constructor(type: ApplicationCommandType = ApplicationCommandType.CHAT_INPUT) {
        this.#command.type = type;
    }

    public name(name: string): this {
        this.#command.name = name;
        return this;
    }

    public nameLocalizations(localizations: ApplicationCommand.Create.ApplicationCommandJSONParams["name_localizations"]): this {
        this.#command.name_localizations = localizations;
        return this;
    }

    public description(description: string): this {
        this.#command.description = description;
        return this;
    }

    public descriptionLocalizations(localizations: ApplicationCommand.Create.ApplicationCommandJSONParams["description_localizations"]): this {
        this.#command.description_localizations = localizations;
        return this;
    }

    public setNSFW(nsfw: boolean): this {
        this.#command.nsfw = nsfw;
        return this;
    }

    public setDMPermission(allow: boolean): this {
        this.#command.dm_permission = allow;
        return this;
    }

    public defaultMemberPermissions(bitfield: number | bigint | Array<typeof PermissionFlags[keyof typeof PermissionFlags]>): this {
        if (Array.isArray(bitfield)) bitfield = bitfield.reduce((a, b) => a | b, 0n);

        this.#command.default_member_permissions = bitfield.toString();
        return this;
    }

    public setOptions(options: ApplicationCommand.Option.SubCommandStructure["options"]): this {
        this.#command.options = options;
        return this;
    }

    public subCommandOption(option: ((option: SubCommandBuilder) => SubCommandBuilder) | SubCommandBuilder): this {
        const realOption = typeof option === "function"
            ? option(new SubCommandBuilder(ApplicationCommandOptionType.SUB_COMMAND)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#command.options)) this.#command.options = [];
        this.#command.options.push(realOption);

        return this;
    }

    public subCommandGroupOption(option: ((option: SubCommandBuilder) => SubCommandBuilder) | SubCommandBuilder): this {
        const realOption = typeof option === "function"
            ? option(new SubCommandBuilder(ApplicationCommandOptionType.SUB_COMMAND_GROUP)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#command.options)) this.#command.options = [];
        this.#command.options.push(realOption);

        return this;
    }

    public stringOption(option: ((option: StringOptionBuilder) => StringOptionBuilder) | StringOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new StringOptionBuilder()).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#command.options)) this.#command.options = [];
        this.#command.options.push(realOption);

        return this;
    }

    public integerOption(option: ((option: NumericOptionBuilder) => NumericOptionBuilder) | NumericOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new NumericOptionBuilder(ApplicationCommandOptionType.INTEGER)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#command.options)) this.#command.options = [];
        this.#command.options.push(realOption);

        return this;
    }

    public booleanOption(option: ((option: BaseOptionBuilder) => BaseOptionBuilder) | BaseOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new BaseOptionBuilder(ApplicationCommandOptionType.BOOLEAN)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#command.options)) this.#command.options = [];
        this.#command.options.push(realOption);

        return this;
    }

    public userOption(option: ((option: BaseOptionBuilder) => BaseOptionBuilder) | BaseOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new BaseOptionBuilder(ApplicationCommandOptionType.USER)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#command.options)) this.#command.options = [];
        this.#command.options.push(realOption);

        return this;
    }

    public channelOption(option: ((option: ChannelOptionBuilder) => ChannelOptionBuilder) | ChannelOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new ChannelOptionBuilder()).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#command.options)) this.#command.options = [];
        this.#command.options.push(realOption);

        return this;
    }

    public roleOption(option: ((option: BaseOptionBuilder) => BaseOptionBuilder) | BaseOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new BaseOptionBuilder(ApplicationCommandOptionType.ROLE)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#command.options)) this.#command.options = [];
        this.#command.options.push(realOption);

        return this;
    }

    public mentionableOption(option: ((option: BaseOptionBuilder) => BaseOptionBuilder) | BaseOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new BaseOptionBuilder(ApplicationCommandOptionType.MENTIONABLE)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#command.options)) this.#command.options = [];
        this.#command.options.push(realOption);

        return this;
    }

    public numberOption(option: ((option: NumericOptionBuilder) => NumericOptionBuilder) | NumericOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new NumericOptionBuilder(ApplicationCommandOptionType.NUMBER)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#command.options)) this.#command.options = [];
        this.#command.options.push(realOption);

        return this;
    }

    public attachmentOption(option: ((option: BaseOptionBuilder) => BaseOptionBuilder) | BaseOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new BaseOptionBuilder(ApplicationCommandOptionType.ATTACHMENT)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#command.options)) this.#command.options = [];
        this.#command.options.push(realOption);

        return this;
    }

    public toJSON(): ApplicationCommand.Create.ApplicationCommandJSONParams {
        return this.#command;
    }
}

export class BaseOptionBuilder {
    readonly #option: ApplicationCommand.Option.Base;

    public constructor(type: ApplicationCommandOptionType) {
        this.#option = <never>{ type };
    }

    public name(name: string): this {
        this.#option.name = name;
        return this;
    }

    public nameLocalizations(localizations: Localizations.Base["name_localizations"]): this {
        this.#option.name_localizations = localizations;
        return this;
    }

    public description(description: string): this {
        this.#option.description = description;
        return this;
    }

    public descriptionLocalizations(localizations: Localizations.Base["description_localizations"]): this {
        this.#option.description_localizations = localizations;
        return this;
    }

    public required(required: boolean): this {
        this.#option.required = required;
        return this;
    }

    public toJSON(): ApplicationCommand.Option.Base {
        return this.#option;
    }
}

export class ChannelOptionBuilder extends BaseOptionBuilder {
    #types: ApplicationCommand.Option.ChannelStructure["channel_types"];

    public constructor() {
        super(ApplicationCommandOptionType.CHANNEL);
    }

    public channelTypes(...channelTypes: Required<ApplicationCommand.Option.ChannelStructure>["channel_types"]): this {
        this.#types = channelTypes;
        return this;
    }

    public override toJSON(): ApplicationCommand.Option.ChannelStructure {
        const opt: ApplicationCommand.Option.ChannelStructure = <never> super.toJSON();
        opt.channel_types = this.#types;
        return opt;
    }
}

export class StringOptionBuilder extends BaseOptionBuilder {
    #min?: number;
    #max?: number;
    #autocomplete?: boolean;
    #choices?: Array<ApplicationCommand.Option.Localizations.ChoiceStructure>;

    public constructor() {
        super(ApplicationCommandOptionType.STRING);
    }

    public minLength(min: number): this {
        this.#min = min;
        return this;
    }

    public maxLength(max: number): this {
        this.#max = max;
        return this;
    }

    public autocomplete(autocomplete: boolean): this {
        this.#autocomplete = autocomplete;
        return this;
    }

    public setChoices(choices: Array<ApplicationCommand.Option.Localizations.ChoiceStructure>): this {
        this.#choices = choices;
        return this;
    }

    public addChoice(choice: ApplicationCommand.Option.Localizations.ChoiceStructure): this {
        if (!Array.isArray(this.#choices)) this.#choices = [];
        this.#choices.push(choice);
        return this;
    }

    public override toJSON(): ApplicationCommand.Option.StringStructure {
        const opt: ApplicationCommand.Option.WithAutocomplete<ApplicationCommand.Option.BaseStringStructure>
        & ApplicationCommand.Option.WithChoices<ApplicationCommand.Option.BaseStringStructure> = <never> super.toJSON();

        opt.min_length = this.#min;
        opt.max_length = this.#max;
        opt.autocomplete = this.#autocomplete;
        opt.choices = this.#choices;

        return opt;
    }
}

export class NumericOptionBuilder extends BaseOptionBuilder {
    #min?: number;
    #max?: number;
    #autocomplete?: boolean;
    #choices?: Array<ApplicationCommand.Option.Localizations.ChoiceStructure>;

    public constructor(type: ApplicationCommandOptionType.NUMBER | ApplicationCommandOptionType.INTEGER) {
        super(type);
    }

    public minValue(min: number): this {
        this.#min = min;
        return this;
    }

    public maxValue(max: number): this {
        this.#max = max;
        return this;
    }

    public autocomplete(autocomplete: boolean): this {
        this.#autocomplete = autocomplete;
        return this;
    }

    public setChoices(choices: Array<ApplicationCommand.Option.Localizations.ChoiceStructure>): this {
        this.#choices = choices;
        return this;
    }

    public addChoice(choice: ApplicationCommand.Option.Localizations.ChoiceStructure): this {
        if (!Array.isArray(this.#choices)) this.#choices = [];
        this.#choices.push(choice);
        return this;
    }

    public override toJSON(): ApplicationCommand.Option.NumericStructure {
        const opt: ApplicationCommand.Option.WithAutocomplete<ApplicationCommand.Option.BaseNumericStructure>
        & ApplicationCommand.Option.WithChoices<ApplicationCommand.Option.BaseNumericStructure> = <never> super.toJSON();

        opt.min_value = this.#min;
        opt.max_value = this.#max;
        opt.autocomplete = this.#autocomplete;
        opt.choices = this.#choices;

        return opt;
    }
}

export class SubCommandBuilder extends BaseOptionBuilder {
    #options?: ApplicationCommand.Option.SubCommandStructure["options"];

    public constructor(type: ApplicationCommandOptionType.SUB_COMMAND | ApplicationCommandOptionType.SUB_COMMAND_GROUP) {
        super(type);
    }

    public setOptions(options: ApplicationCommand.Option.SubCommandStructure["options"]): this {
        this.#options = options;
        return this;
    }

    public subCommandOption(option: ((option: SubCommandBuilder) => SubCommandBuilder) | SubCommandBuilder): this {
        const realOption = typeof option === "function"
            ? option(new SubCommandBuilder(ApplicationCommandOptionType.SUB_COMMAND)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#options)) this.#options = [];
        this.#options.push(realOption);

        return this;
    }

    public subCommandGroupOption(option: ((option: SubCommandBuilder) => SubCommandBuilder) | SubCommandBuilder): this {
        const realOption = typeof option === "function"
            ? option(new SubCommandBuilder(ApplicationCommandOptionType.SUB_COMMAND_GROUP)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#options)) this.#options = [];
        this.#options.push(realOption);

        return this;
    }

    public stringOption(option: ((option: StringOptionBuilder) => StringOptionBuilder) | StringOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new StringOptionBuilder()).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#options)) this.#options = [];
        this.#options.push(realOption);

        return this;
    }

    public integerOption(option: ((option: NumericOptionBuilder) => NumericOptionBuilder) | NumericOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new NumericOptionBuilder(ApplicationCommandOptionType.INTEGER)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#options)) this.#options = [];
        this.#options.push(realOption);

        return this;
    }

    public booleanOption(option: ((option: BaseOptionBuilder) => BaseOptionBuilder) | BaseOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new BaseOptionBuilder(ApplicationCommandOptionType.BOOLEAN)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#options)) this.#options = [];
        this.#options.push(realOption);

        return this;
    }

    public userOption(option: ((option: BaseOptionBuilder) => BaseOptionBuilder) | BaseOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new BaseOptionBuilder(ApplicationCommandOptionType.USER)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#options)) this.#options = [];
        this.#options.push(realOption);

        return this;
    }

    public channelOption(option: ((option: ChannelOptionBuilder) => ChannelOptionBuilder) | ChannelOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new ChannelOptionBuilder()).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#options)) this.#options = [];
        this.#options.push(realOption);

        return this;
    }

    public roleOption(option: ((option: BaseOptionBuilder) => BaseOptionBuilder) | BaseOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new BaseOptionBuilder(ApplicationCommandOptionType.ROLE)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#options)) this.#options = [];
        this.#options.push(realOption);

        return this;
    }

    public mentionableOption(option: ((option: BaseOptionBuilder) => BaseOptionBuilder) | BaseOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new BaseOptionBuilder(ApplicationCommandOptionType.MENTIONABLE)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#options)) this.#options = [];
        this.#options.push(realOption);

        return this;
    }

    public numberOption(option: ((option: NumericOptionBuilder) => NumericOptionBuilder) | NumericOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new NumericOptionBuilder(ApplicationCommandOptionType.NUMBER)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#options)) this.#options = [];
        this.#options.push(realOption);

        return this;
    }

    public attachmentOption(option: ((option: BaseOptionBuilder) => BaseOptionBuilder) | BaseOptionBuilder): this {
        const realOption = typeof option === "function"
            ? option(new BaseOptionBuilder(ApplicationCommandOptionType.ATTACHMENT)).toJSON()
            : option.toJSON();

        if (!Array.isArray(this.#options)) this.#options = [];
        this.#options.push(realOption);

        return this;
    }

    public override toJSON(): ApplicationCommand.Option.SubCommandStructure {
        const opt: ApplicationCommand.Option.SubCommandStructure = <never> super.toJSON();
        opt.options = this.#options;
        return opt;
    }
}
