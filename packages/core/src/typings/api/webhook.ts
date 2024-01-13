import type { WebhookType } from "#enums";
import type {
    MessageComponentStructure,
    AllowedMentionsStructure,
    AttachmentStructure,
    LilybirdAttachment,
    ChannelStructure,
    GuildStructure,
    EmbedStructure,
    UserStructure
} from "../index.js";

export interface EditWebhookStructure {
    content?: string | null;
    embeds?: Array<EmbedStructure> | null;
    allowed_mentions?: AllowedMentionsStructure | null;
    components?: Array<MessageComponentStructure> | null;
    files?: Array<LilybirdAttachment>;
    payload_json?: string | null;
    attachments?: Array<Partial<AttachmentStructure>> | null;
}

export interface ExecuteWebhookStructure {
    content?: string;
    username?: string;
    avatar_url?: string;
    tts?: boolean;
    embeds?: Array<EmbedStructure>;
    allowed_mentions?: AllowedMentionsStructure;
    components?: Array<MessageComponentStructure>;
    files?: Array<LilybirdAttachment>;
    payload_json?: string;
    attachments?: Array<Partial<AttachmentStructure>>;
    /** MessageFlags.EPHEMERAL | MessageFlags.SUPPRESS_EMBEDS */
    flags?: number;
    thread_name?: string;
}

export interface WebhookStructure {
    id: string;
    type: WebhookType;
    guild_id?: string | null;
    channel_id: string | null;
    user?: UserStructure;
    name: string | null;
    avatar: string | null;
    token?: string;
    application_id: string | null;
    source_guild?: Partial<GuildStructure>;
    source_channel?: Partial<ChannelStructure>;
    url?: string;
}
