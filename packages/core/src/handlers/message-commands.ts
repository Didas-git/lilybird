import type { Message } from "../factories/message";
import type { Awaitable } from "../typings";

export interface MessageCommand {
    name: string;
    alias?: Array<string>;
    description?: string;
    enabled?: boolean;
    run: (message: Message, args: Array<string>) => Awaitable<unknown>;
}
