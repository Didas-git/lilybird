import type { ThreadChannelStructure, GuildMemberStructure, AttachmentStructure, MessageStructure, ChannelStructure, EmojiStructure, RoleStructure, UserStructure } from "..";

import type { ApplicationCommandOptionType, ApplicationCommandType, InteractionType, EntitlementType, TextInputStyle, ComponentType, ChannelType, ButtonStyle, Locale } from "../../enums";

interface BaseInteractionStructure {
    id: string;
    application_id: string;
    type: InteractionType;
    data?: InteractionDataStructure;
    token: string;
    version: number;
    locale: Locale;
    entitlements: Array<EntitlementStructure>;
}

export interface GuildInteractionStructure extends BaseInteractionStructure {
    guild_id: string;
    channel: Partial<ChannelStructure>;
    channel_id: string;
    member: GuildMemberStructure;
    app_permissions: string;
    guild_locale: Locale;
}

export interface DMInteractionStructure extends BaseInteractionStructure {
    user: UserStructure;
}

export interface GuildPingInteractionStructure extends GuildInteractionStructure {
    type: InteractionType.PING;
}

export interface DMPingInteractionStructure extends DMInteractionStructure {
    type: InteractionType.PING;
}

export type PingInteractionStructure = GuildPingInteractionStructure | DMPingInteractionStructure;

export interface GuildApplicationCommandInteractionStructure extends GuildInteractionStructure {
    type: InteractionType.APPLICATION_COMMAND | InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE;
    data: ApplicationCommandDataStructure;
}

export interface DMApplicationCommandInteractionStructure extends DMInteractionStructure {
    type: InteractionType.APPLICATION_COMMAND | InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE;
    data: ApplicationCommandDataStructure;
}

export type ApplicationCommandInteractionStructure = GuildApplicationCommandInteractionStructure | DMApplicationCommandInteractionStructure;

export interface GuildMessageComponentInteractionStructure extends GuildInteractionStructure {
    type: InteractionType.MESSAGE_COMPONENT;
    data: MessageComponentDataStructure;
    message: MessageStructure;
}

export interface DMMessageComponentInteractionStructure extends DMInteractionStructure {
    type: InteractionType.MESSAGE_COMPONENT;
    data: MessageComponentDataStructure;
    message: MessageStructure;
}

export type MessageComponentInteractionStructure = GuildMessageComponentInteractionStructure | DMMessageComponentInteractionStructure;

export interface GuildModalSubmitInteractionStructure extends GuildInteractionStructure {
    type: InteractionType.MODAL_SUBMIT;
    data: ModalSubmitDataStructure;
}

export interface DMModalSubmitInteractionStructure extends DMInteractionStructure {
    type: InteractionType.MODAL_SUBMIT;
    data: ModalSubmitDataStructure;
}

export type ModalSubmitInteractionStructure = GuildModalSubmitInteractionStructure | DMModalSubmitInteractionStructure;

export type InteractionStructure = PingInteractionStructure | ApplicationCommandInteractionStructure | MessageComponentInteractionStructure | ModalSubmitInteractionStructure;

export type InteractionDataStructure = ApplicationCommandDataStructure | MessageComponentDataStructure | ModalSubmitDataStructure;

export interface ApplicationCommandDataStructure {
    id: string;
    name: string;
    type: ApplicationCommandType;
    resolved?: ResolvedDataStructure;
    options?: Array<ApplicationCommandInteractionDataOptionStructure>;
    guild_id?: string;
    target_id?: string;
}

export interface ResolvedDataStructure {
    users?: Record<string, UserStructure>;
    members?: Record<string, Omit<GuildMemberStructure, "user" | "deaf" | "mute">>;
    roles?: Record<string, RoleStructure>;
    channels?: Record<string, Pick<ThreadChannelStructure, "id" | "name" | "type" | "permissions" | "thread_metadata" | "parent_id">>;
    messages?: Record<string, Partial<MessageStructure>>;
    attachments?: Record<string, AttachmentStructure>;
}

export interface ApplicationCommandInteractionDataOptionStructure {
    name: string;
    type: ApplicationCommandOptionType;
    value?: string | number | boolean;
    options?: Array<ApplicationCommandInteractionDataOptionStructure>;
    focused?: boolean;
}

export interface MessageComponentDataStructure {
    custom_id: string;
    component_type: ComponentType;
    values?: Array<SelectOptionStructure>;
    resolved?: ResolvedDataStructure;
}

export interface SelectOptionStructure {
    label: string;
    value: string;
    description?: string;
    emoji?: Pick<EmojiStructure, "id" | "name" | "animated">;
    default?: boolean;
}

export interface ModalSubmitDataStructure {
    custom_id: string;
    components: Array<MessageComponentStructure>;
}

export interface MessageInteractionStructure {
    id: string;
    type: InteractionType;
    name: string;
    user: UserStructure;
    member?: Partial<GuildMemberStructure>;
}

export type MessageComponentStructure = ActionRowStructure | ButtonStructure | SelectMenuStructure | TextInputStructure;

export interface MessageComponentBase {
    type: ComponentType;
}

export interface ActionRowStructure extends MessageComponentBase {
    type: ComponentType.ActionRow;
    components: Array<MessageComponentStructure>;
}

export interface ButtonStructure extends MessageComponentBase {
    type: ComponentType.Button;
    style: ButtonStyle;
    label?: string;
    emoji?: Pick<EmojiStructure, "name" | "id" | "animated">;
    custom_id?: string;
    url?: string;
    disabled?: boolean;
}

export interface SelectMenuStructure extends MessageComponentBase {
    type: ComponentType.StringSelect | ComponentType.UserSelect | ComponentType.RoleSelect | ComponentType.MentionableSelect | ComponentType.ChannelSelect;
    custom_id: string;
    options?: Array<SelectOptionStructure>;
    channel_types?: Array<ChannelType>;
    placeholder?: string;
    default_values?: Array<SelectDefaultValueStructure>;
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
}

export interface SelectDefaultValueStructure {
    id: string;
    type: "user" | "role" | "channel";
}

export interface TextInputStructure {
    type: ComponentType.TextInput;
    custom_id: string;
    style: TextInputStyle;
    label: string;
    min_length?: number;
    max_length?: number;
    required?: boolean;
    value?: string;
    placeholder?: string;
}

export interface EntitlementStructure {
    id: string;
    sku_id: string;
    user_id?: string;
    guild_id?: string;
    application_id: string;
    type: EntitlementType;
    consumed: boolean;
    /** ISO8601 Timestamp */
    starts_at: string;
    /** ISO8601 Timestamp */
    ends_at: string;
}
