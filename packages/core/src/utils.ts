import { MessageType } from "#enums";

export const DiscordEpoch = 1420070400000n;

export function extractTimestampFromId(id: string): number {
    return Number((BigInt(id) >> 22n) + DiscordEpoch);
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#message-object-message-types}
 */
export function isDeletableMessage(type: MessageType, canManageMessages: boolean = false): boolean {
    if (type === MessageType.AUTO_MODERATION_ACTION /* 24 */) return canManageMessages;
    return type === MessageType.DEFAULT /* 0 */
        // eslint-disable-next-line @stylistic/no-extra-parens
        || (type >= MessageType.CHANNEL_PINNED_MESSAGE /* 6 */ && type <= MessageType.CHAT_INPUT_COMMAND /* 20 */)
        || type >= MessageType.GUILD_INVITE_REMINDER; /* 22 */
}
