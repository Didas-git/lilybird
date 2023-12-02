/* eslint-disable @typescript-eslint/naming-convention */
import type { BunFile } from "bun";

export function Attachment({
    path,
    name,
}: {
    path: string | BunFile;
    name: string;
}): Attachment {
    return {
        file: typeof path === "string" ? Bun.file(path) : path,
        name,
    };
}
