/* eslint-disable @typescript-eslint/naming-convention */
import type { LilybirdAttachment } from "lilybird";

export function Attachment(props: LilybirdAttachment | { path: string, name: string }): LilybirdAttachment {
    return {
        file: "path" in props ? Bun.file(props.path) : props.file,
        name: props.name
    };
}
