import type { LilybirdAttachment } from "lilybird";

export function makeAttachmentURL(attachment: LilybirdAttachment): string {
    return `attachment://${attachment.name}`;
}
