import type { PrivacyLevel } from "../enums/index.js";

export interface StageInstanceStructure {
    id: string;
    guild_id: string;
    channel_id: string;
    topic: string;
    privacy_level: PrivacyLevel;
    discoverable_disabled: boolean;
    guild_scheduled_event_id: string | null;
}
