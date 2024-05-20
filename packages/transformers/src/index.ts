import { transformers } from "./transformers.js";
import type { Transformers } from "lilybird";

export type DefaultTransformers = MergeTransformers<typeof transformers>;
export const defaultTransformers: DefaultTransformers = transformers;

export type MergeTransformers<T extends Transformers> = T & {
    [K in keyof Transformers as T[K] extends {} ? never : K]: Transformers[K]
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
