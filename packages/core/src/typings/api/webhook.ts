import type { AllowedMentionsStructure, AttachmentStructure, MessageComponentStructure, EmbedStructure, LilybirdAttachment } from "../";

export interface EditWebhookStructure {
    content?: string | null;
    embeds?: Array<EmbedStructure> | null;
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
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
