import type { AttachmentStructure, EmbedStructure, MessageComponentStructure } from "..";
import type { Attachment } from "../../builders";

export interface ReplyOptions {
    content?: string;
    embeds?: Array<EmbedStructure>;
    components?: Array<MessageComponentStructure>;
    attachments?: Array<Partial<AttachmentStructure>>;
    files?: Array<Attachment>;
}