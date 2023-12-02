import type { Attachment, AttachmentStructure, EmbedStructure, MessageComponentStructure } from "..";

export interface ReplyOptions {
    content?: string;
    embeds?: Array<EmbedStructure>;
    components?: Array<MessageComponentStructure>;
    attachments?: Array<Partial<AttachmentStructure>>;
    files?: Array<Attachment>;
}
