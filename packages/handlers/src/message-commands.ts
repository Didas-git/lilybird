import type { Message, Awaitable } from "lilybird";

export interface MessageCommand {
    name: string;
    alias?: Array<string>;
    description?: string;
    enabled?: boolean;
    run: (message: Message, args: Array<string>) => Awaitable<unknown>;
}
