import type { Channel, Embed, LilybirdAttachment, Message, Poll } from "lilybird";

export interface ReplyOptions {
    content?: string;
    embeds?: Array<Embed.Structure>;
    components?: Array<Message.Component.Structure>;
    attachments?: Array<Partial<Channel.AttachmentStructure>>;
    files?: Array<LilybirdAttachment>;
    poll?: Poll.CreateStructure;
}
