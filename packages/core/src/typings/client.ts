import type { UnavailableGuildStructure } from "./index.js";
import type { Message, PartialMessage } from "../factories/message.js";
import type { Channel, ExtendedThreadChannel, ThreadChannel } from "../factories/channel.js";
import type { GuildMemberWithGuildId } from "../factories/guild-member.js";
import type { InviteCreate, InviteDelete, MessageDeleteBulk, PresenceUpdate, Ready, UpdatePresenceStructure } from "./gateway/gateway-events.js";
import type { Interaction } from "../factories/interaction.js";
import type { User } from "../factories/user.js";
import type { Intents } from "#enums";
import type { Awaitable } from "./utils.js";
import type { Client } from "../client.js";
import type { Guild, NewGuild } from "../factories/guild.js";

export interface ClientEventListeners {
    raw?: (data: unknown) => Awaitable<unknown>;
    ready?: (client: Client, payload: Ready["d"]) => Awaitable<unknown>;
    resumed?: (client: Client) => Awaitable<unknown>;
    channelCreate?: (channel: Channel) => Awaitable<unknown>;
    channelUpdate?: (channel: Channel) => Awaitable<unknown>;
    channelDelete?: (channel: Channel) => Awaitable<unknown>;
    channelPinsUpdate?: (guildId: string | undefined, channelId: string, lastPinTimestamp: Date | null) => Awaitable<unknown>;
    threadCreate?: (channel: ExtendedThreadChannel) => Awaitable<unknown>;
    threadUpdate?: (channel: Channel) => Awaitable<unknown>;
    threadDelete?: (channel: Pick<ThreadChannel, "id" | "guildId" | "parentId" | "type">) => Awaitable<unknown>;
    guildCreate?: (guild: UnavailableGuildStructure | NewGuild) => Awaitable<unknown>;
    guildUpdate?: (guild: Guild) => Awaitable<unknown>;
    guildDelete?: (guild: UnavailableGuildStructure) => Awaitable<unknown>;
    guildMemberAdd?: (member: GuildMemberWithGuildId) => Awaitable<unknown>;
    guildMemberRemove?: (id: string, user: User) => Awaitable<unknown>;
    guildMemberUpdate?: (member: GuildMemberWithGuildId) => Awaitable<unknown>;
    interactionCreate?: (interaction: Interaction) => Awaitable<unknown>;
    inviteCreate?: (invite: InviteCreate["d"]) => Awaitable<unknown>;
    inviteDelete?: (Invite: InviteDelete["d"]) => Awaitable<unknown>;
    messageCreate?: (message: Message) => Awaitable<unknown>;
    messageUpdate?: (message: PartialMessage) => Awaitable<unknown>;
    messageDelete?: (message: PartialMessage) => Awaitable<unknown>;
    messageDeleteBulk?: (message: MessageDeleteBulk["d"]) => Awaitable<unknown>;
    presenceUpdate?: (presence: PresenceUpdate["d"]) => Awaitable<unknown>;
    userUpdate?: (user: User) => Awaitable<unknown>;
}

export interface BaseClientOptions {
    intents: number;
    listeners: ClientEventListeners;
    presence?: UpdatePresenceStructure;
    setup?: (client: Client) => Awaitable<any>;
}

export interface ClientOptions extends Omit<BaseClientOptions, "intents"> {
    intents: Array<Intents> | number;
    token: string;
    attachDebugListener?: boolean;
    debugListener?: (identifier: string, payload: unknown) => void;
}
