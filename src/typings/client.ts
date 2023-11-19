import type { Interaction, InteractionData } from "../factories/interaction";
import type { Channel } from "../factories/channel";
import type { User } from "../factories/user";
import type { Awaitable } from "./utils";
import type { Intents } from "../enums";
import type { Client } from "../client";

import type {
    Ready
} from "./gateway-events";

export interface ClientEventListeners {
    raw?: (data: unknown) => Awaitable<unknown>;
    ready?: (client: Client, payload: Ready["d"]) => Awaitable<unknown>;
    resumed?: (client: Client) => Awaitable<unknown>;
    channelCreate?: (channel: Channel) => Awaitable<unknown>;
    channelUpdate?: (channel: Channel) => Awaitable<unknown>;
    channelDelete?: (channel: Channel) => Awaitable<unknown>;
    threadUpdate?: (channel: Channel) => Awaitable<unknown>;
    userUpdate?: (user: User) => Awaitable<unknown>;
    interactionCreate?: (interaction: Interaction<InteractionData>) => Awaitable<unknown>;
}

export interface BaseClientOptions {
    intents: Array<Intents> | number;
    listeners: ClientEventListeners;
    setup?: (client: Client) => Awaitable<any>;
}

export interface ClientOptions extends BaseClientOptions {
    token: string;
    attachDebugListener?: boolean;
    debugListener?: (identifier: string, payload: unknown) => void;
}