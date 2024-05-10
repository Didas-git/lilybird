import type { WebhookType } from "#enums";
import type { Channel } from "./channel.js";
import type { Embed } from "./embed.js";
import type { Guild } from "./guild.js";
import type { Message } from "./message.js";
import type { User } from "./user.js";

export declare namespace Webhook {
    export interface Structure {
        id: string;
        type: WebhookType;
        guild_id?: string | null;
        channel_id: string | null;
        user?: User.Structure;
        name: string | null;
        avatar: string | null;
        token?: string;
        application_id: string | null;
        source_guild?: Partial<Guild.Structure>;
        source_channel?: Partial<Channel.Structure>;
        url?: string;
    }

    export interface EditWebhookJSONParams {
        content?: string | null;
        embeds?: Array<Embed.Structure> | null;
        allowed_mentions?: Channel.AllowedMentionsStructure | null;
        components?: Array<Message.Component.Structure> | null;
        attachments?: Array<Partial<Channel.AttachmentStructure>> | null;
    }

    export interface ExecuteWebhookJSONParams {
        content?: string;
        username?: string;
        avatar_url?: string;
        tts?: boolean;
        embeds?: Array<Embed.Structure>;
        allowed_mentions?: Channel.AllowedMentionsStructure;
        components?: Array<Message.Component.Structure>;
        attachments?: Array<Partial<Channel.AttachmentStructure>>;
        /** MessageFlags.EPHEMERAL | MessageFlags.SUPPRESS_EMBEDS */
        flags?: number;
        thread_name?: string;
        applied_tags?: Array<string>;
    }

}
