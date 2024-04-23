import type { PrivacyLevel } from "../../enums/guild.js";

export interface CreateStageInstanceStructure {
    channel_id: string;
    topic: string;
    privacy_level?: PrivacyLevel;
    send_start_notification?: boolean;
    guild_scheduled_event_id?: string;
    reason?: string;
}
