export enum VerificationLevel {
    NONE,
    LOW,
    MEDIUM,
    HIGH,
    VERY_HIGH,
}

export enum DefaultMessageNotificationLevel {
    ALL_MESSAGES,
    ONLY_MENTIONS,
}

export enum ExplicitContentFilterLevel {
    DISABLED,
    MEMBERS_WITHOUT_ROLES,
    ALL_MEMBERS,
}

export enum MFALevel {
    NONE,
    ELEVATED,
}

export enum SystemChannelFlags {
    SUPPRESS_JOIN_NOTIFICATIONS = 1,
    SUPPRESS_PREMIUM_SUBSCRIPTIONS = 2,
    SUPPRESS_GUILD_REMINDER_NOTIFICATIONS = 4,
    SUPPRESS_JOIN_NOTIFICATION_REPLIES = 8,
    SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATIONS = 16,
    SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATION_REPLIES = 32,
}

export enum PremiumTier {
    NONE,
    TIER_1,
    TIER_2,
    TIER_3,
}

export enum GuildNSFWLevel {
    DEFAULT,
    EXPLICIT,
    SAFE,
    AGE_RESTRICTED,
}

export enum GuildMemberFlags {
    DID_REJOIN = 1,
    COMPLETED_ONBOARDING,
    BYPASSES_VERIFICATION = 4,
    STARTED_ONBOARDING = 8,
}

export enum IntegrationExpireBehavior {
    RemoveRole,
    Role,
}

export enum InviteTargetType {
    STREAM = 1,
    EMBEDDED_APPLICATION,
}

export enum RoleFlags {
    IN_PROMPT = 1,
}

export enum PrivacyLevel {
    PUBLIC = 1,
    GUILD_ONLY,
}

export enum OnboardingMode {
    ONBOARDING_DEFAULT,
    ONBOARDING_ADVANCED,
}

export enum PromptType {
    MULTIPLE_CHOICE,
    DROPDOWN,
}
