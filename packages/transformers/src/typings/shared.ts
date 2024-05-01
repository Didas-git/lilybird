import type { AttachmentStructure, EmbedStructure, LilybirdAttachment, MessageComponentStructure } from "lilybird";

export interface ReplyOptions {
    content?: string;
    embeds?: Array<EmbedStructure>;
    components?: Array<MessageComponentStructure>;
    attachments?: Array<Partial<AttachmentStructure>>;
    files?: Array<LilybirdAttachment>;
}
