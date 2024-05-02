import type { Guild } from "./guild.js";

export declare namespace Voice {
    /**
     * @see {@link https://discord.com/developers/docs/resources/voice#voice-region-object-voice-region-structure}
     */
    export interface RegionStructure {
        id: string;
        name: string;
        optimal: boolean;
        deprecated: boolean;
        custom: boolean;
    }

    export interface StateStructure {
        guild_id?: string;
        channel_id: string | null;
        user_id: string;
        member?: Guild.MemberStructure;
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
}
