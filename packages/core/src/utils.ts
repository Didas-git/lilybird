import { MessageType } from "#enums";

export const DiscordEpoch = 1420070400000n;

export function extractTimestampFromId(id: string): number {
    return Number((BigInt(id) >> 22n) + DiscordEpoch);
}

// https://discord.com/developers/docs/resources/channel#message-object-message-types
const DeletableTypes = [
    MessageType.DEFAULT,
    MessageType.CHANNEL_PINNED_MESSAGE,
    MessageType.USER_JOIN,
    MessageType.GUILD_BOOST,
    MessageType.GUILD_BOOST_TIER_1,
    MessageType.GUILD_BOOST_TIER_2,
    MessageType.GUILD_BOOST_TIER_3,
    MessageType.CHANNEL_FOLLOW_ADD,
    MessageType.THREAD_CREATED,
    MessageType.REPLY,
    MessageType.CHAT_INPUT_COMMAND,
    MessageType.GUILD_INVITE_REMINDER,
    MessageType.CONTEXT_MENU_COMMAND,
    MessageType.AUTO_MODERATION_ACTION,
    MessageType.ROLE_SUBSCRIPTION_PURCHASE,
    MessageType.INTERACTION_PREMIUM_UPSELL,
    MessageType.STAGE_START,
    MessageType.STAGE_END,
    MessageType.STAGE_SPEAKER,
    MessageType.STAGE_TOPIC
];

export function isDeletableMessage(msgType: MessageType): boolean {
    return DeletableTypes.includes(msgType);
}
