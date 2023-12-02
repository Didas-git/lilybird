export interface WelcomeScreenStructure {
    description: string | null;
    welcome_channels: Array<WelcomeScreenChannelStructure>;
}

export interface WelcomeScreenChannelStructure {
    channel_id: string;
    description: string;
    emoji_id?: string | null;
    emoji_name?: string | null;
}