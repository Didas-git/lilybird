/* eslint-disable @typescript-eslint/naming-convention */
import type { BunFile } from "bun";

export interface Attachment {
    file: BunFile;
    name: string;
}

export function Attachment({
    path,
    name
}: {
    path: string | BunFile,
    name: string
}): Attachment {
    return {
        // @ts-expect-error This works in bun
        file: typeof path === "string" ? Bun.file(`${import.meta.dir}/${path}`) : path,
        name
    };
}