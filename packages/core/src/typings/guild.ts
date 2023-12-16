import type {
    WelcomeScreenStructure,
    StickerStructure,
    EmojiStructure,
    UserStructure,
    RoleStructure,
    OAuthScopes
} from "./index.js";

import type {
    DefaultMessageNotificationLevel,
    ExplicitContentFilterLevel,
    IntegrationExpireBehavior,
    SystemChannelFlags,
    VerificationLevel,
    GuildMemberFlags,
    GuildNSFWLevel,
    PremiumTier,
    MFALevel,
    Locale
} from "../enums/index.js";

export interface UnavailableGuildStructure {
    id: string;
    unavailable?: true;
}

export interface GuildStructure {
    id: string;
    name: string;
    icon: string | null;
    icon_hash?: string | null;
    splash: string | null;
    discovery_splash: string | null;
    owner?: boolean;
    owner_id: string;
    permissions?: string;
    afk_channel_id: string | null;
    afk_timeout: number;
    widget_enabled?: boolean;
    widget_channel_id?: string | null;
    verification_level: VerificationLevel;
    default_message_notifications: DefaultMessageNotificationLevel;
    explicit_content_filter: ExplicitContentFilterLevel;
    roles: Array<RoleStructure>;
    emojis: Array<EmojiStructure>;
    features: Array<GuildFeatures>;
    mfa_level: MFALevel;
    application_id: string | null;
    system_channel_id: string | null;
    system_channel_flags: SystemChannelFlags;
    rules_channel_id: string | null;
    max_presences?: number | null;
    max_members?: number;
    vanity_url_code: string | null;
    description: string | null;
    banner: string | null;
    premium_tier: PremiumTier;
    premium_subscription_count?: number;
    preferred_locale: Locale;
    public_updates_channel_id: string | null;
    max_video_channel_users?: number;
    max_stage_video_channel_users?: number;
    approximate_member_count?: number;
    approximate_presence_count?: number;
    welcome_screen?: WelcomeScreenStructure;
    nsfw_level: GuildNSFWLevel;
    stickers?: Array<StickerStructure>;
    premium_progress_bar_enabled: boolean;
    safety_alerts_channel_id: string | null;
}

export type GuildFeatures =
    | "ANIMATED_BANNER"
    | "ANIMATED_ICON"
    | "APPLICATION_COMMAND_PERMISSIONS_V2"
    | "AUTO_MODERATION"
    | "BANNER"
    | "COMMUNITY"
    | "CREATOR_MONETIZABLE_PROVISIONAL"
    | "CREATOR_STORE_PAGE"
    | "DEVELOPER_SUPPORT_SERVER"
    | "DISCOVERABLE"
    | "FEATURABLE"
    | "INVITES_DISABLED"
    | "INVITE_SPLASH"
    | "MEMBER_VERIFICATION_GATE_ENABLED"
    | "MORE_STICKERS"
    | "NEWS"
    | "PARTNERED"
    | "PREVIEW_ENABLED"
    | "RAID_ALERTS_DISABLED"
    | "ROLE_ICONS"
    | "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE"
    | "ROLE_SUBSCRIPTIONS_ENABLED"
    | "TICKETED_EVENTS_ENABLED"
    | "VANITY_URL"
    | "VERIFIED"
    | "VIP_REGIONS"
    | "WELCOME_SCREEN_ENABLED";

export type MutableGuildFeatures = "COMMUNITY" | "DISCOVERABLE" | "INVITES_DISABLED" | "RAID_ALERTS_DISABLED";

export interface GuildMemberStructure {
    user?: UserStructure;
    nick?: string | null;
    avatar?: string | null;
    roles: Array<string>;
    /** ISO8601 Timestamp */
    joined_at: string;
    /** ISO8601 Timestamp */
    premium_since?: string | null;
    deaf: boolean;
    mute: boolean;
    flags: GuildMemberFlags;
    pending?: boolean;
    permissions?: string;
    /** ISO8601 Timestamp */
    communication_disabled_until?: string | null;
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
