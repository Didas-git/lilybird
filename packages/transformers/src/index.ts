import type { BaseCachingStructure } from "lilybird";
import type { Transformers } from "lilybird";

export { makeTransformersObject } from "./transformers.js";

export const cacheKeys: Required<BaseCachingStructure>["customKeys"] = {
    guild_voice_states: "voiceStates"
};

export const acsKeys = {
    sub_command: "data.subCommand",
    sub_command_group: "data.subCommandGroup",
    name: "data.name"
};

export type MergeTransformers<C, T extends Transformers<C>> = T & {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    [K in keyof Transformers<C> as T[K] extends {} ? never : K]: Transformers<C>[K]
};

export type {
    GuildApplicationCommandData,
    InteractionShowModalOptions,
    UIApplicationCommandData,
    InteractionReplyOptions,
    ApplicationCommandData,
    InteractionEditOptions,
    MessageComponentData,
    AutocompleteData,
    InteractionData,
    ModalSubmitData,
    FocusedOption
} from "./factories/interaction.js";

export type {
    ExtendedThreadChannel,
    MessageSendOptions,
    PartialChannel
} from "./factories/channel.js";

export type {
    MessageReplyOptions,
    MessageEditOptions,
    PartialMessage
} from "./factories/message.js";

export type {
    GuildMemberWithGuildId,
    ModifyMemberOptions,
    PartialGuildMember
} from "./factories/guild-member.js";

export { GuildMember } from "./factories/guild-member.js";
export { Guild, NewGuild } from "./factories/guild.js";
export { Message } from "./factories/message.js";
export { User } from "./factories/user.js";

export {
    GuildInteraction,
    DMInteraction,
    Interaction
} from "./factories/interaction.js";

export {
    GuildAnnouncementChannel,
    GuildChannelCategory,
    GuildVoiceChannel,
    ThreadLikeChannel,
    GuildTextChannel,
    MentionChannel,
    GroupDMChannel,
    ThreadChannel,
    ThreadMember,
    GuildChannel,
    DMChannel,
    Channel
} from "./factories/channel.js";

export {
    Poll,
    PollAnswer
} from "./factories/poll.js";
