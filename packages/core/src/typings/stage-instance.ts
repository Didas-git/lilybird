import type { PrivacyLevel } from "#enums";

export declare namespace StageInstance {
    export interface Structure {
        id: string;
        guild_id: string;
        channel_id: string;
        topic: string;
        privacy_level: PrivacyLevel;
        discoverable_disabled: boolean;
        guild_scheduled_event_id: string | null;
    }

    export interface CreateJSONParams {
        channel_id: string;
        topic: string;
        privacy_level?: PrivacyLevel;
        send_start_notification?: boolean;
        guild_scheduled_event_id?: string;
        reason?: string;
    }
}
