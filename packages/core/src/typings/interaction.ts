import type { ApplicationCommandOption } from "./application-command-options.js";
import type { LilybirdAttachment, ResolvedDataStructure } from "./others.js";
import type { ApplicationCommand } from "./application-command.js";
import type { Channel } from "./channel.js";
import type { Message } from "./message.js";
import type { Guild } from "./guild.js";
import type { Embed } from "./embed.js";
import type { User } from "./user.js";
import type { Poll } from "./poll.js";

import type {
    InteractionCallbackType,
    EntitlementType,
    InteractionType,
    ComponentType,
    Locale
} from "#enums";

export declare namespace Interaction {
    export type Structure = PingInteractionStructure | ApplicationCommandInteractionStructure | MessageComponentInteractionStructure | ModalSubmitInteractionStructure;

    export interface Base {
        id: string;
        application_id: string;
        type: InteractionType;
        data?: DataStructure;
        token: string;
        version: number;
        locale: Locale;
        entitlements: Array<EntitlementStructure>;
    }

    export interface GuildStructure extends Base {
        guild_id: string;
        channel: Partial<Channel.Structure>;
        channel_id: string;
        member: Guild.MemberStructure;
        app_permissions: string;
        guild_locale: Locale;
    }

    export interface DMStructure extends Base {
        user: User.Structure;
    }

    export type PingInteractionStructure = GuildPingStructure | DMPingStructure;

    export interface GuildPingStructure extends GuildStructure {
        type: InteractionType.PING;
    }

    export interface DMPingStructure extends DMStructure {
        type: InteractionType.PING;
    }

    export type ApplicationCommandInteractionStructure = GuildApplicationCommandInteractionStructure | DMApplicationCommandInteractionStructure;

    export interface GuildApplicationCommandInteractionStructure extends GuildStructure {
        type: InteractionType.APPLICATION_COMMAND | InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE;
        data: ApplicationCommand.DataStructure;
    }

    export interface DMApplicationCommandInteractionStructure extends DMStructure {
        type: InteractionType.APPLICATION_COMMAND | InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE;
        data: ApplicationCommand.DataStructure;
    }

    export type MessageComponentInteractionStructure = GuildMessageComponentInteractionStructure | DMMessageComponentInteractionStructure;

    export interface GuildMessageComponentInteractionStructure extends GuildStructure {
        type: InteractionType.MESSAGE_COMPONENT;
        data: MessageComponentDataStructure;
        message: Message.Structure;
    }

    export interface DMMessageComponentInteractionStructure extends DMStructure {
        type: InteractionType.MESSAGE_COMPONENT;
        data: MessageComponentDataStructure;
        message: Message.Structure;
    }

    export type ModalSubmitInteractionStructure = GuildModalSubmitInteractionStructure | DMModalSubmitInteractionStructure;

    export interface GuildModalSubmitInteractionStructure extends GuildStructure {
        type: InteractionType.MODAL_SUBMIT;
        data: ModalSubmitDataStructure;
    }

    export interface DMModalSubmitInteractionStructure extends DMStructure {
        type: InteractionType.MODAL_SUBMIT;
        data: ModalSubmitDataStructure;
    }

    export type DataStructure = ApplicationCommand.DataStructure | MessageComponentDataStructure | ModalSubmitDataStructure;

    export interface MessageComponentDataStructure {
        custom_id: string;
        component_type: ComponentType;
        values?: Array<string>;
        resolved?: ResolvedDataStructure;
    }

    export interface ModalSubmitDataStructure {
        custom_id: string;
        components: Array<Message.Component.Structure>;
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

    export interface ResponseJSONParams {
        type: InteractionCallbackType;
        data?: CallbackData;
    }

    export type CallbackData = MessageCallbackDataStructure | AutocompleteCallbackDataStructure | ModalCallbackDataStructure;

    export interface AutocompleteCallbackDataStructure {
        choices: Array<ApplicationCommandOption.ChoiceStructure>;
    }

    export interface MessageCallbackDataStructure {
        tts?: boolean;
        content?: string;
        embeds?: Array<Embed.Structure>;
        allowed_mentions?: Channel.AllowedMentionsStructure;
        /** MessageFlags.EPHEMERAL | MessageFlags.SUPPRESS_EMBEDS */
        flags?: number;
        components?: Array<Message.Component.Structure>;
        attachments?: Array<Partial<Channel.AttachmentStructure>>;
        files?: Array<LilybirdAttachment>;
<<<<<<< HEAD
        poll?: Poll.CreateStructure;
=======
>>>>>>> 7cfd140 (Completely change type organization)
    }

    export interface ModalCallbackDataStructure {
        custom_id: string;
        title: string;
        components: Array<Message.Component.Structure>;
    }
}
