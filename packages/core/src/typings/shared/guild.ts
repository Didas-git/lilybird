import type { GuildScheduledEventEntityMetadata } from "./guild-schedule-event.js";
import type { GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel, GuildScheduledEventStatus, IntegrationExpireBehavior } from "#enums";
import type { OAuthScopes } from "../gateway/oauth2.js";
import type { UserStructure } from "./user.js";

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

export interface IntegrationStructure {
    id: string;
    name: string;
    type: string;
    enabled: boolean;
    syncing?: boolean;
    role_id?: string;
    enable_emoticons?: boolean;
    expire_behavior?: IntegrationExpireBehavior;
    expire_grace_period?: number;
    user?: UserStructure;
    account: IntegrationAccountStructure;
    /** ISO8601 Timestamp */
    synced_at?: string;
    subscriber_count?: number;
    revoked?: boolean;
    application?: IntegrationApplicationStructure;
    scopes?: Array<OAuthScopes>;
}

export interface IntegrationAccountStructure {
    id: string;
    name: string;
}

export interface IntegrationApplicationStructure {
    id: string;
    name: string;
    icon: string | null;
    description: string;
    bot?: UserStructure;
}

export interface GuildScheduledEventStructure {
    id: string;
    guild_id: string;
    channel_id: string | null;
    creator_id?: string | null;
    name: string;
    description?: string | null;
    /* ISO8601 Timestamp */
    scheduled_start_time: string;
    /* ISO8601 Timestamp */
    scheduled_end_time: string | null;
    privacy_level: GuildScheduledEventPrivacyLevel;
    status: GuildScheduledEventStatus;
    entity_type: GuildScheduledEventEntityType;
    entity_id: string | null;
    entity_metadata: GuildScheduledEventEntityMetadata | null;
    creator?: UserStructure;
    user_count?: number;
    image?: string | null;
}
