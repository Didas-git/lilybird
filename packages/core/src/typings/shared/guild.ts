import type { IntegrationExpireBehavior } from "#enums";
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
