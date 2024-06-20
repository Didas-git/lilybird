import { ThreadChannel, channelFactory } from "./factories/channel.js";
import { interactionFactory } from "./factories/interaction.js";
import { GuildMember } from "./factories/guild-member.js";
import { guildFactory } from "./factories/guild.js";
import { TransformerReturnType } from "lilybird";
import { User } from "./factories/user.js";
import { Message } from "./index.js";

import type { Channel, ExtendedThreadChannel } from "./factories/channel.js";
import type { GuildMemberWithGuildId } from "./factories/guild-member.js";
import type { Transformers, Guild as LilyGuild } from "lilybird";
import type { Interaction, PartialMessage } from "./index.js";
import type { Guild, NewGuild } from "./factories/guild.js";

export const transformers = {
    channelCreate: {
        return: TransformerReturnType.SINGLE,
        handler: (client, data): Channel => channelFactory(client, data)
    },
    channelUpdate: {
        return: TransformerReturnType.SINGLE,
        handler: (client, data): Channel => channelFactory(client, data)
    },
    channelDelete: {
        return: TransformerReturnType.SINGLE,
        handler: (client, data): Channel => channelFactory(client, data)
    },
    channelPinsUpdate: {
        return: TransformerReturnType.MULTIPLE,
        handler: (_, data): [guildId: string | undefined, channelId: string, lastPinTimestamp: Date | null] => [
            data.guild_id,
            data.channel_id,
            typeof data.last_pin_timestamp === "string" ? new Date(data.last_pin_timestamp) : null
        ]
    },
    threadCreate: {
        return: TransformerReturnType.SINGLE,
        handler: (client, data): ExtendedThreadChannel => <never>channelFactory(client, data)
    },
    threadUpdate: {
        return: TransformerReturnType.SINGLE,
        handler: (client, data): Channel => channelFactory(client, data)
    },
    threadDelete: {
        return: TransformerReturnType.SINGLE,
        handler: (client, data): Pick<ThreadChannel, "id" | "guildId" | "parentId" | "type"> => new ThreadChannel(client, <never>data, false)
    },
    guildCreate: {
        return: TransformerReturnType.SINGLE,
        handler: (client, data): LilyGuild.UnavailableStructure | NewGuild => guildFactory(client, data)
    },
    guildUpdate: {
        return: TransformerReturnType.SINGLE,
        handler: (client, data): Guild => guildFactory(client, data)
    },
    guildMemberAdd: {
        return: TransformerReturnType.SINGLE,
        handler: (client, data): GuildMemberWithGuildId => <never> new GuildMember(client, data)
    },
    guildMemberRemove: {
        return: TransformerReturnType.MULTIPLE,
        handler: (client, data): [id: string, user: User] => [data.guild_id, new User(client, data.user)]
    },
    guildMemberUpdate: {
        return: TransformerReturnType.SINGLE,
        handler: (client, data): GuildMemberWithGuildId => <never> new GuildMember(client, <never>data)
    },
    interactionCreate: {
        return: TransformerReturnType.SINGLE,
        handler: (client, data): Interaction => interactionFactory(client, data)
    },
    messageCreate: {
        return: TransformerReturnType.SINGLE,
        handler: (client, data): Message => new Message(client, data)
    },
    messageUpdate: {
        return: TransformerReturnType.SINGLE,
        handler: (client, data): PartialMessage => new Message(client, <never>data)
    },
    messageDelete: {
        return: TransformerReturnType.SINGLE,
        handler: (client, data): PartialMessage => new Message(client, <never>data)
    },
    userUpdate: {
        return: TransformerReturnType.SINGLE,
        handler: (client, data): User => new User(client, data)
    }
} satisfies Transformers;
