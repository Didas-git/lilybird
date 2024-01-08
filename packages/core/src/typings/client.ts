import type { Message, PartialMessage } from "../factories/message.js";
import type { Channel, ThreadChannel } from "../factories/channel.js";
import type { GuildMemberWithGuildId } from "../factories/guild.js";
import type { MessageDeleteBulk, Ready, UpdatePresenceStructure } from "./gateway/gateway-events.js";
import type { Interaction } from "../factories/interaction.js";
import type { User } from "../factories/user.js";
import type { Intents } from "../enums/index.js";
import type { Awaitable } from "./utils.js";
import type { Client } from "../client.js";

export interface ClientEventListeners {
    raw?: (data: unknown) => Awaitable<unknown>;
    ready?: (client: Client, payload: Ready["d"]) => Awaitable<unknown>;
    resumed?: (client: Client) => Awaitable<unknown>;
    channelCreate?: (channel: Channel) => Awaitable<unknown>;
    channelUpdate?: (channel: Channel) => Awaitable<unknown>;
    channelDelete?: (channel: Channel) => Awaitable<unknown>;
    threadUpdate?: (channel: Channel) => Awaitable<unknown>;
    threadDelete?: (channel: Pick<ThreadChannel, "id" | "guildId" | "parentId" | "type">) => Awaitable<unknown>;
    guildMemberAdd?: (member: GuildMemberWithGuildId) => Awaitable<unknown>;
    guildMemberRemove?: (id: string, user: User) => Awaitable<unknown>;
    guildMemberUpdate?: (member: GuildMemberWithGuildId) => Awaitable<unknown>;
    messageCreate?: (message: Message) => Awaitable<unknown>;
    messageUpdate?: (message: PartialMessage) => Awaitable<unknown>;
    messageDelete?: (message: PartialMessage) => Awaitable<unknown>;
    messageDeleteBulk?: (message: MessageDeleteBulk["d"]) => Awaitable<unknown>;
    userUpdate?: (user: User) => Awaitable<unknown>;
    interactionCreate?: (interaction: Interaction) => Awaitable<unknown>;
}

export interface BaseClientOptions {
    intents: Array<Intents> | number;
    listeners: ClientEventListeners;
    presence?: UpdatePresenceStructure;
    setup?: (client: Client) => Awaitable<any>;
}

export interface ClientOptions extends BaseClientOptions {
    token: string;
    attachDebugListener?: boolean;
    debugListener?: (identifier: string, payload: unknown) => void;
}
