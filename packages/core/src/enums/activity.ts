export enum ActivityType {
    Game,
    Streaming,
    Listening,
    Watching,
    Custom,
    Competing,
}

export enum ActivityFlags {
    INSTANCE = 1,
    JOIN = 2,
    SPECTATE = 4,
    JOIN_REQUEST = 8,
    SYNC = 16,
    PLAY = 32,
    PARTY_PRIVACY_FRIENDS = 64,
    PARTY_PRIVACY_VOICE_CHANNEL = 128,
    EMBEDDED = 256,
}
