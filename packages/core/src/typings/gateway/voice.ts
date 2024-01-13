import type { GuildMemberStructure } from "./guild.js";

export interface VoiceStateStructure {
    guild_id?: string;
    channel_id: string | null;
    user_id: string;
    member?: GuildMemberStructure;
    session_id: string;
    deaf: boolean;
    mute: boolean;
    self_deaf: boolean;
    self_mute: boolean;
    self_stream?: boolean;
    self_video: boolean;
    suppress: boolean;
    /** ISO8601 Timestamp */
    request_to_speak_timestamp: string | null;
}
