export const DiscordEpoch = 1420070400000n;

export function extractTimestampFromId(id: string): number {
    return Number((BigInt(id) >> 22n) + DiscordEpoch);
}
