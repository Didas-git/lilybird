import { Attachment as Att } from "lilybird";
import type { BunFile } from "bun";

export function Attachment({
    path,
    name,
}: {
    path: string | BunFile;
    name: string;
}): Att {
    return {
        file: typeof path === "string" ? Bun.file(path) : path,
        name,
    };
}
