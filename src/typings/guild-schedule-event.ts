import type { UserStructure } from ".";

import type {
    GuildScheduledEventPrivacyLevel,
    GuildScheduledEventEntityTypes,
    GuildScheduledEventStatus
} from "../enums";

export interface GuildScheduleEventStructure {
    id: string;
    guild_id: string;
    channel_id: string | null;
    creator_id?: string | null;
    name: string;
    description?: string | null;
    /** ISO8601 Timestamp */
    scheduled_start_time: string;
    /** ISO8601 Timestamp */
    scheduled_end_time: string | null;
    privacy_level: GuildScheduledEventPrivacyLevel;
    status: GuildScheduledEventStatus;
    entity_type: GuildScheduledEventEntityTypes;
    entity_id: string | null;
    entity_metadata: GuildScheduledEventEntityMetadata | null;
    creator?: UserStructure;
    user_count?: number;
    image?: string | null;
}

export interface GuildScheduledEventEntityMetadata {
    location?: string;
}