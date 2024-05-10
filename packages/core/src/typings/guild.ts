import type { DiscordImageData } from "./image-data.js";
import type { OAuthScopes } from "./oauth2.js";
import type { Channel } from "./channel.js";
import type { Emoji } from "./emoji.js";
import type { Role } from "./role.js";
import type { User } from "./user.js";

import type {
    DefaultMessageNotificationLevel,
    GuildScheduledEventPrivacyLevel,
    GuildScheduledEventEntityType,
    ExplicitContentFilterLevel,
    GuildScheduledEventStatus,
    IntegrationExpireBehavior,
    SystemChannelFlags,
    VerificationLevel,
    VideoQualityMode,
    GuildMemberFlag,
    IntegrationType,
    ForumLayoutType,
    GuildNSFWLevel,
    OnboardingMode,
    SortOrderType,
    PremiumTier,
    ChannelType,
    PromptType,
    MFALevel,
    Locale
} from "#enums";
import type { Sticker } from "./sticker.js";
import type { Voice } from "./voice.js";
import type { PresenceUpdateEventFields } from "./gateway-events.js";
import type { StageInstance } from "./stage-instance.js";

export declare namespace Guild {
    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-structure}
     */
    export interface Structure {
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
        roles: Array<Role.Structure>;
        emojis: Array<Emoji.Structure>;
        features: Array<Feature>;
        mfa_level: MFALevel;
        application_id: string | null;
        system_channel_id: string | null;
        /**
         * Bitfield of {@link SystemChannelFlags}
         */
        system_channel_flags: number;
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
        stickers?: Array<Sticker.Structure>;
        premium_progress_bar_enabled: boolean;
        safety_alerts_channel_id: string | null;
    }

    /**
     * @see {@link https://discord.com/developers/docs/topics/gateway-events#guild-create-guild-create-extra-fields}
     */
    export interface New extends Structure {
        /** ISO8601 Timestamp */
        joined_at: string;
        large: boolean;
        unavailable?: boolean;
        member_count: number;
        voice_states: Array<Partial<Voice.StateStructure>>;
        members: Array<MemberStructure>;
        channels: Array<Channel.Structure>;
        threads: Array<Channel.Structure>;
        presences: Array<Partial<PresenceUpdateEventFields>>;
        stage_instances: Array<StageInstance.Structure>;
        guild_scheduled_events: Array<ScheduledEventStructure>;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-features}
     */
    export type Feature =
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

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-mutable-guild-features}
     */
    export type MutableFeatures = "COMMUNITY" | "DISCOVERABLE" | "INVITES_DISABLED" | "RAID_ALERTS_DISABLED";

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#unavailable-guild-object}
     */
    export interface UnavailableStructure {
        id: string;
        unavailable?: true;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-preview-object-guild-preview-structure}
     */
    export interface PreviewStructure {
        id: string;
        name: string;
        icon: string | null;
        splash: string | null;
        discovery_splash: string | null;
        emojis: Array<Emoji.Structure>;
        features: Array<Feature>;
        approximate_member_count: number;
        approximate_presence_count: number;
        description: string | null;
        stickers: Array<Sticker.Structure>;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-settings-object-guild-widget-settings-structure}
     */
    export interface WidgetSettingsStructure {
        enabled: boolean;
        channel_id: string | null;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-object-guild-widget-structure}
     */
    export interface WidgetStructure {
        id: string;
        name: string;
        instant_invite: string | null;
        channels: Array<Partial<Channel.Structure>>;
        members: Array<Partial<User.Structure>>;
        presence_count: number;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-structure}
     */
    export interface MemberStructure {
        user?: User.Structure;
        nick?: string | null;
        avatar?: string | null;
        roles: Array<string>;
        /** ISO8601 Timestamp */
        joined_at: string;
        /** ISO8601 Timestamp */
        premium_since?: string | null;
        deaf: boolean;
        mute: boolean;
        /**
         * Bitfield of {@link GuildMemberFlag}
         */
        flags: number;
        pending?: boolean;
        permissions?: string;
        /** ISO8601 Timestamp */
        communication_disabled_until?: string | null;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-structure}
     */
    export interface IntegrationStructure {
        id: string;
        name: string;
        type: IntegrationType;
        enabled: boolean;
        syncing?: boolean;
        role_id?: string;
        enable_emoticons?: boolean;
        expire_behavior?: IntegrationExpireBehavior;
        expire_grace_period?: number;
        user?: User.Structure;
        account: IntegrationAccountStructure;
        /** ISO8601 Timestamp */
        synced_at?: string;
        subscriber_count?: number;
        revoked?: boolean;
        application?: IntegrationApplicationStructure;
        scopes?: Array<OAuthScopes>;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#integration-account-object-integration-account-structure}
     */
    export interface IntegrationAccountStructure {
        id: string;
        name: string;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#integration-application-object}
     */
    export interface IntegrationApplicationStructure {
        id: string;
        name: string;
        icon: string | null;
        description: string;
        bot?: User.Structure;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#ban-object-ban-structure}
     */
    export interface BanStructure {
        reason: string | null;
        user: User.Structure;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-structure}
     */
    export interface WelcomeScreenStructure {
        description: string | null;
        welcome_channels: Array<WelcomeScreenChannelStructure>;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-channel-structure}
     */
    export interface WelcomeScreenChannelStructure {
        channel_id: string;
        description: string;
        emoji_id?: string | null;
        emoji_name?: string | null;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-guild-onboarding-structure}
     */
    export interface OnboardingStructure {
        guild_id: string;
        prompts: Array<OnboardingPromptStructure>;
        default_channel_ids: Array<string>;
        enabled: boolean;
        mode: OnboardingMode;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-prompt-structure}
     */
    export interface OnboardingPromptStructure {
        id: string;
        type: PromptType;
        options: Array<PromptOptionStructure>;
        title: string;
        single_select: boolean;
        required: boolean;
        in_onboarding: boolean;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-option-structure}
     */
    export interface PromptOptionStructure {
        id: string;
        channel_ids: Array<string>;
        role_ids: Array<string>;
        emoji?: Emoji.Structure;
        emoji_id?: string;
        emoji_name?: string;
        emoji_animated?: boolean;
        title: string;
        description: string | null;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-structure}
     */
    export interface ScheduledEventStructure {
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
        entity_metadata: ScheduledEventEntityMetadata | null;
        creator?: User.Structure;
        user_count?: number;
        image?: string | null;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-metadata}
     */
    export interface ScheduledEventEntityMetadata {
        location?: string;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/guild-template#guild-template-object-guild-template-structure}
     */
    export interface TemplateStructure {
        code: string;
        name: string;
        description: string | null;
        usage_count: number;
        creator_id: string;
        creator: User.Structure;
        /* ISO8601 Timestamp */
        created_at: string;
        /* ISO8601 Timestamp */
        updated_at: string;
        source_guild_id: string;
        serialized_source_guild: Partial<Structure>;
        is_dirty: boolean | null;
    }

    export namespace Create {
        /**
         * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-json-params}
         */
        export interface GuildJSONParams {
            name: string;
            icon?: DiscordImageData;
            verification_level?: VerificationLevel;
            default_message_notifications?: DefaultMessageNotificationLevel;
            explicit_content_filter?: ExplicitContentFilterLevel;
            roles?: Array<Role.Structure>;
            channels?: Partial<Channel.Structure>;
            afk_channel_id?: string;
            afk_timeout?: number;
            system_channel_id?: string;
            /**
             * Bitfield of {@link SystemChannelFlags}
             */
            system_channel_flags?: number;
        }

        /**
         * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-channel-json-params}
         */
        export interface GuildChannelJSONParams {
            /**
             * `X-Audit-Log-Reason` Header
             */
            reason?: string;
            name: string;
            type?: ChannelType | null;
            topic?: string | null;
            bitrate?: number | null;
            user_limit?: number | null;
            rate_limit_per_user?: number | null;
            position?: number | null;
            permission_overwrites?: Array<Partial<Channel.OverwriteStructure>> | null;
            parent_id?: string | null;
            nsfw?: boolean | null;
            rtc_region?: string | null;
            video_quality_mode?: VideoQualityMode | null;
            default_auto_archive_duration?: number | null;
            default_reaction_emoji?: Channel.DefaultReactionStructure | null;
            available_tags?: Array<Channel.ForumTagStructure> | null;
            default_sort_order?: SortOrderType | null;
            default_forum_layout?: ForumLayoutType | null;
            default_thread_rate_limit_per_user?: number | null;
        }

        /**
         * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event-json-params}
         */
        export interface ScheduledEventJSONParams {
            /**
             * `X-Audit-Log-Reason` Header
             */
            reason?: string;
            channel_id?: string;
            entity_metadata?: ScheduledEventEntityMetadata;
            name: string;
            privacy_level: GuildScheduledEventPrivacyLevel;
            /* ISO8601 Timestamp */
            scheduled_start_time: string;
            /* ISO8601 Timestamp */
            scheduled_end_time?: string;
            description?: string;
            entity_type: GuildScheduledEventEntityType;
            image?: DiscordImageData;
        }
    }

    export namespace Modify {
        /**
         * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-json-params}
         */
        export interface GuildJSONParams {
            /**
             * `X-Audit-Log-Reason` Header
             */
            reason?: string;
            name?: string;
            verification_level?: VerificationLevel | null;
            default_message_notifications?: DefaultMessageNotificationLevel | null;
            explicit_content_filter?: ExplicitContentFilterLevel | null;
            afk_channel_id?: string | null;
            afk_timeout?: number;
            icon?: DiscordImageData;
            owner_id?: string;
            splash?: DiscordImageData | null;
            discovery_splash?: DiscordImageData | null;
            banner?: DiscordImageData | null;
            system_channel_id?: string | null;
            /**
             * Bitfield of {@link SystemChannelFlags}
             */
            system_channel_flags?: number;
            rules_channel_id?: string | null;
            public_updates_channel_id?: string | null;
            preferred_locale?: Locale | null;
            features?: Array<Feature>;
            description?: string | null;
            premium_progress_bar_enabled?: boolean;
            safety_alerts_channel_id?: string | null;
        }

        /**
         * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions-json-params}
         */
        export interface ChannelPositionJSONParams {
            id: string;
            position?: number | null;
            lock_permissions?: boolean | null;
            parent_id?: string | null;
        }
    }
}
