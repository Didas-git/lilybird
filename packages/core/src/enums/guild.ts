export const enum VerificationLevel {
    NONE,
    LOW,
    MEDIUM,
    HIGH,
    VERY_HIGH
}

export const enum DefaultMessageNotificationLevel {
    ALL_MESSAGES,
    ONLY_MENTIONS
}

export const enum ExplicitContentFilterLevel {
    DISABLED,
    MEMBERS_WITHOUT_ROLES,
    ALL_MEMBERS
}

export const enum MFALevel {
    NONE,
    ELEVATED
}

export const enum SystemChannelFlags {
    SUPPRESS_JOIN_NOTIFICATIONS = 1,
    SUPPRESS_PREMIUM_SUBSCRIPTIONS = 2,
    SUPPRESS_GUILD_REMINDER_NOTIFICATIONS = 4,
    SUPPRESS_JOIN_NOTIFICATION_REPLIES = 8,
    SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATIONS = 16,
    SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATION_REPLIES = 32
}

export const enum PremiumTier {
    NONE,
    TIER_1,
    TIER_2,
    TIER_3
}

export const enum GuildNSFWLevel {
    DEFAULT,
    EXPLICIT,
    SAFE,
    AGE_RESTRICTED
}

export const enum GuildMemberFlag {
    DID_REJOIN = 1,
    COMPLETED_ONBOARDING,
    BYPASSES_VERIFICATION = 4,
    STARTED_ONBOARDING = 8,
    IS_GUEST = 16,
    STARTED_HOME_ACTIONS = 32,
    COMPLETED_HOME_ACTIONS = 64,
    AUTOMOD_QUARANTINED_USERNAME = 128,
    DM_SETTINGS_UPSELL_ACKNOWLEDGED = 256
}

export const enum IntegrationType {
    Twitch = "twitch",
    Youtube = "youtube",
    Discord = "discord",
    GuildSubscription = "guild_subscription"
}

export const enum IntegrationExpireBehavior {
    RemoveRole,
    Role
}

export const enum InviteTargetType {
    STREAM = 1,
    EMBEDDED_APPLICATION
}

export const enum RoleFlags {
    IN_PROMPT = 1
}

export const enum PrivacyLevel {
    PUBLIC = 1,
    GUILD_ONLY
}

export const enum OnboardingMode {
    ONBOARDING_DEFAULT,
    ONBOARDING_ADVANCED
}

export const enum PromptType {
    MULTIPLE_CHOICE,
    DROPDOWN
}
