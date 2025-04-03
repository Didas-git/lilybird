import type { ApplicationCommandOptionType, ChannelType } from "#enums";
import type { Localizations as _Localizations } from "./localizations.js";
import type { ApplicationCommand } from "./application-command.js";

declare namespace LocalizedApplicationCommandOption {
    export interface Structure extends ApplicationCommand.OptionStructureWithoutNarrowing, _Localizations.Localized {
        choices?: Array<ChoiceStructure>;
        options?: Array<Structure>;
    }
    export interface ChoiceStructure extends ApplicationCommand.Option.ChoiceStructure, Pick<_Localizations.Localized, "name_localized"> {}
}

declare namespace LocalizationsApplicationCommandOption {
    export interface Structure extends ApplicationCommand.OptionStructureWithoutNarrowing, _Localizations.Base {
        choices?: Array<ChoiceStructure>;
        options?: Array<Structure>;
    }
    export interface ChoiceStructure extends ApplicationCommand.Option.ChoiceStructure, Pick<_Localizations.Base, "name_localizations"> {}
}

export declare namespace ApplicationCommandOption {
    export import Localizations = LocalizationsApplicationCommandOption;
    export import Localized = LocalizedApplicationCommandOption;

    export type Structure =
        | ChannelStructure
        | StringStructure
        | NumericStructure
        | SubCommandStructure
        | Base;

    export interface Base extends _Localizations.Base {
        type: ApplicationCommandOptionType;
        name: string;
        description: string;
        required?: boolean;
    }

    export type WithChoices<T> = T & { choices?: Array<ChoiceStructure> };
    export type WithAutocomplete<T> = T & { autocomplete?: boolean };

    export interface ChoiceStructure {
        name: string;
        value: string | number;
    }

    export interface SubCommandStructure extends Base {
        type: ApplicationCommandOptionType.SUB_COMMAND | ApplicationCommandOptionType.SUB_COMMAND_GROUP;
        options?: Array<Structure>;
    }

    export type NumericStructure = WithChoices<BaseNumericStructure> | WithAutocomplete<BaseNumericStructure>;

    export interface BaseNumericStructure extends Base {
        type: ApplicationCommandOptionType.NUMBER | ApplicationCommandOptionType.INTEGER;
        min_value?: number;
        max_value?: number;
    }

    export type StringStructure = WithChoices<BaseStringStructure> | WithAutocomplete<BaseStringStructure>;

    export interface BaseStringStructure extends Base {
        type: ApplicationCommandOptionType.STRING;
        min_length?: number;
        max_length?: number;
    }

    export interface ChannelStructure extends Base {
        type: ApplicationCommandOptionType.CHANNEL;
        channel_types?: Array<ChannelType>;
    }
}

