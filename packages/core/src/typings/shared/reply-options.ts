import type { LilybirdAttachment, MessageComponentStructure } from "../index.js";
import type { AttachmentStructure, EmbedStructure } from "./message.js";

export interface ReplyOptions {
    content?: string;
    embeds?: Array<EmbedStructure>;
    components?: Array<MessageComponentStructure>;
    attachments?: Array<Partial<AttachmentStructure>>;
    files?: Array<LilybirdAttachment>;
}
