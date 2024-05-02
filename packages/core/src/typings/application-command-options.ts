import type { ApplicationCommandOptionType, ChannelType } from "#enums";
import type { Localizations as _Localizations } from "./localizations.js";
import type { ApplicationCommand } from "./application-command.js";

declare namespace LocalizedApplicationCommandOption {
    export interface Structure extends ApplicationCommand.OptionStructureWithoutNarrowing, _Localizations.Localized {
        choices?: Array<ChoiceStructure>;
        options?: Array<Structure>;
    }
    export interface ChoiceStructure extends ApplicationCommand.Option.ChoiceStructure, _Localizations.Localized {}
}

declare namespace LocalizationsApplicationCommandOption {
    export interface Structure extends ApplicationCommand.OptionStructureWithoutNarrowing, _Localizations.Base {
        choices?: Array<ChoiceStructure>;
        options?: Array<Structure>;
    }
    export interface ChoiceStructure extends ApplicationCommand.Option.ChoiceStructure, _Localizations.Base {}
}

export declare namespace ApplicationCommandOption {
    export import Localizations = LocalizationsApplicationCommandOption;
    export import Localized = LocalizedApplicationCommandOption;

    export type Structure =
        | ChannelStructure
        | WithChoices<StringStructure>
        | WithAutocomplete<StringStructure>
        | WithChoices<NumericStructure>
        | WithAutocomplete<NumericStructure>
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

    export interface NumericStructure extends Base {
        type: ApplicationCommandOptionType.NUMBER | ApplicationCommandOptionType.INTEGER;
        min_value?: number;
        max_value?: number;
    }

    export interface StringStructure extends Base {
        type: ApplicationCommandOptionType.STRING;
        min_length?: number;
        max_length?: number;
    }

    export interface ChannelStructure extends Base {
        type: ApplicationCommandOptionType.CHANNEL;
        channel_types?: Array<ChannelType>;
    }
}

