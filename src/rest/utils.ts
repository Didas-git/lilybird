import type { MessageType } from "../enums";

export function messageTypeDeletable(msgType: MessageType): boolean {
    // https://discord.com/developers/docs/resources/channel#message-object-message-types
    return [0, 6, 7, 8, 9, 10, 11, 12, 18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29, 31].includes(msgType);
}
