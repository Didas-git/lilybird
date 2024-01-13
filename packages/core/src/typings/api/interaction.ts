import type { AllowedMentionsStructure, AttachmentStructure, MessageComponentStructure, EmbedStructure, LilybirdAttachment } from "../index.js";

import type { ApplicationCommandOptionType, InteractionCallbackType, ApplicationCommandType, ChannelType, Locale } from "#enums";

export interface POSTApplicationCommandStructure extends LocalizationsShared {
    name: string;
    description?: string;
    options?: Array<ApplicationCommandOptionStructure>;
    default_member_permissions?: string | null;
    dm_permission?: boolean | null;
    type?: ApplicationCommandType;
    nsfw?: boolean;
}

export interface GlobalApplicationCommandStructure {
    id: string;
    type?: ApplicationCommandType;
    application_id: string;
    name: string;
    description: string;
    options?: Array<ReturnApplicationCommandOptionStructure>;
    default_member_permissions: string | null;
    dm_permission: boolean;
    nsfw?: boolean;
    version: number;
}

export interface ReturnApplicationCommandOptionStructure {
    type: ApplicationCommandOptionType;
    name: string;
    description: string;
    required?: boolean;
    choices?: Array<ApplicationCommandOptionChoiceStructure>;
    options?: Array<ReturnApplicationCommandOptionStructure>;
    channel_types?: Array<ChannelType>;
    min_value?: number;
    max_value?: number;
    min_length?: number;
    max_length?: number;
    autocomplete?: boolean;
}

export interface GuildApplicationCommandStructure {
    id: string;
    type?: ApplicationCommandType;
    application_id: string;
    guild_id: string;
    name: string;
    description: string;
    options?: Array<ReturnApplicationCommandOptionStructure>;
    default_member_permissions: string | null;
    nsfw?: boolean;
    version: number;
}

export interface BaseApplicationCommandOptionStructure extends LocalizationsShared {
    type: ApplicationCommandOptionType;
    name: string;
    description: string;
    required?: boolean;
}

export interface SubCommandApplicationCommandOptionStructure extends BaseApplicationCommandOptionStructure {
    type: ApplicationCommandOptionType.SUB_COMMAND | ApplicationCommandOptionType.SUB_COMMAND_GROUP;
    options?: Array<ApplicationCommandOptionStructure>;
}

export interface NumericApplicationCommandOptionStructure extends BaseApplicationCommandOptionStructure {
    type: ApplicationCommandOptionType.NUMBER | ApplicationCommandOptionType.INTEGER;
    min_value?: number;
    max_value?: number;
}

export interface StringApplicationCommandOptionStructure extends BaseApplicationCommandOptionStructure {
    type: ApplicationCommandOptionType.STRING;
    min_length?: number;
    max_length?: number;
}

export interface ChannelApplicationCommandOptionStructure extends BaseApplicationCommandOptionStructure {
    type: ApplicationCommandOptionType.CHANNEL;
    channel_types?: Array<ChannelType>;
}

type CommandWithChoices<T> = T & { choices?: Array<ApplicationCommandOptionChoiceStructure> };
export type CommandWithAutocomplete<T> = T & { autocomplete?: boolean };

export type ApplicationCommandOptionStructure =
    | ChannelApplicationCommandOptionStructure
    | CommandWithChoices<StringApplicationCommandOptionStructure>
    | CommandWithAutocomplete<StringApplicationCommandOptionStructure>
    | CommandWithChoices<NumericApplicationCommandOptionStructure>
    | CommandWithAutocomplete<NumericApplicationCommandOptionStructure>
    | SubCommandApplicationCommandOptionStructure
    | BaseApplicationCommandOptionStructure;

export interface ApplicationCommandOptionChoiceStructure {
    name: string;
    value: string | number;
}

interface LocalizedShared {
    name_localized: string;
    description_localized: string;
}

export interface LocalizationsShared {
    name_localizations?: Record<Locale, string> | null;
    description_localizations?: Record<Locale, string> | null;
}

export interface LocalizedGlobalApplicationCommandStructure extends GlobalApplicationCommandStructure, LocalizedShared {
    options?: Array<LocalizedApplicationCommandOptionStructure>;
}

export interface LocalizedGuildApplicationCommandStructure extends GuildApplicationCommandStructure, LocalizedShared {
    options?: Array<LocalizedApplicationCommandOptionStructure>;
}

export interface LocalizationGlobalApplicationCommandStructure extends GlobalApplicationCommandStructure, LocalizationsShared {
    options?: Array<LocalizationApplicationCommandOptionStructure>;
}

export interface LocalizationGuildApplicationCommandStructure extends GuildApplicationCommandStructure, LocalizationsShared {
    options?: Array<LocalizationApplicationCommandOptionStructure>;
}

export interface LocalizedApplicationCommandOptionStructure extends ReturnApplicationCommandOptionStructure, LocalizedShared {
    choices?: Array<LocalizedApplicationCommandOptionChoiceStructure>;
    options?: Array<LocalizedApplicationCommandOptionStructure>;
}

export interface LocalizationApplicationCommandOptionStructure extends ReturnApplicationCommandOptionStructure, LocalizationsShared {
    choices?: Array<LocalizationApplicationCommandOptionChoiceStructure>;
    options?: Array<LocalizationApplicationCommandOptionStructure>;
}

export interface LocalizedApplicationCommandOptionChoiceStructure extends ApplicationCommandOptionChoiceStructure, LocalizedShared {}

export interface LocalizationApplicationCommandOptionChoiceStructure extends ApplicationCommandOptionChoiceStructure, LocalizationsShared {}

export interface InteractionResponseStructure {
    type: InteractionCallbackType;
    data?: InteractionCallbackData;
}

export type InteractionCallbackData = MessageCallbackDataStructure | AutocompleteCallbackDataStructure | ModalCallbackDataStructure;

export interface MessageCallbackDataStructure {
    tts?: boolean;
    content?: string;
    embeds?: Array<EmbedStructure>;
    allowed_mentions?: AllowedMentionsStructure;
    /** MessageFlags.EPHEMERAL | MessageFlags.SUPPRESS_EMBEDS */
    flags?: number;
    components?: Array<MessageComponentStructure>;
    attachments?: Array<Partial<AttachmentStructure>>;
    files?: Array<LilybirdAttachment>;
}

export interface AutocompleteCallbackDataStructure {
    choices: Array<ApplicationCommandOptionChoiceStructure>;
}

export interface ModalCallbackDataStructure {
    custom_id: string;
    title: string;
    components: Array<MessageComponentStructure>;
}

export type ApplicationCommandStructure = LocalizationGlobalApplicationCommandStructure | LocalizationGuildApplicationCommandStructure;
