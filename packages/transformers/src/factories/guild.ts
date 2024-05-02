import { GuildMember } from "./guild-member.js";
import { channelFactory } from "./channel.js";
import type { Channel } from "./channel.js";

import type {
    Guild as LilyGuild,
    DefaultMessageNotificationLevel,
    ExplicitContentFilterLevel,
    PresenceUpdateEventFields,
    VerificationLevel,
    GuildNSFWLevel,
    PremiumTier,
    MFALevel,
    Locale,
    Client,
    Role,
    Emoji,
    Sticker,
    Voice,
    StageInstance
} from "lilybird";

// No comments...
export function guildFactory(client: Client, guild: LilyGuild.New): NewGuild;
export function guildFactory(client: Client, guild: LilyGuild.UnavailableStructure): LilyGuild.UnavailableStructure;
export function guildFactory(client: Client, guild: LilyGuild.Structure): Guild;
export function guildFactory(client: Client, guild: LilyGuild.UnavailableStructure | LilyGuild.New): LilyGuild.UnavailableStructure | NewGuild;
export function guildFactory(client: Client, guild: LilyGuild.UnavailableStructure | LilyGuild.Structure | LilyGuild.New): LilyGuild.UnavailableStructure | Guild | NewGuild {
    if ("joined_at" in guild) return new NewGuild(client, guild);
    if ("unavailable" in guild) return guild;
    return new Guild(client, <LilyGuild.Structure>guild);
}

export class Guild {
    public readonly id: string;
    public readonly name: string;
    public readonly icon: string | null;
    public readonly iconHash: string | undefined | null;
    public readonly splash: string | null;
    public readonly discoverySplash: string | null;
    public readonly owner: boolean | undefined;
    public readonly ownerId: string;
    public readonly permissions: string | undefined;
    public readonly afkChannelId: string | null;
    public readonly afkTimeout: number;
    public readonly widgetEnabled: boolean | undefined;
    public readonly widgetChannelId: string | undefined | null;
    public readonly verificationLevel: VerificationLevel;
    public readonly defaultMessageNotifications: DefaultMessageNotificationLevel;
    public readonly explicitContentFilter: ExplicitContentFilterLevel;
    public readonly roles: Array<Role.Structure>;
    public readonly emojis: Array<Emoji.Structure>;
    public readonly features: Array<LilyGuild.Feature>;
    public readonly mfaLevel: MFALevel;
    public readonly applicationId: string | null;
    public readonly systemChannelId: string | null;
    public readonly systemChannelFlags: number;
    public readonly rulesChannelId: string | null;
    public readonly maxPresences: number | undefined | null;
    public readonly maxMembers: number | undefined;
    public readonly vanityUrlCode: string | null;
    public readonly description: string | null;
    public readonly banner: string | null;
    public readonly premiumTier: PremiumTier;
    public readonly premiumSubscriptionCount: number;
    public readonly preferredLocale: Locale;
    public readonly publicUpdatesChannelId: string | null;
    public readonly maxVideoChannelUsers: number | undefined;
    public readonly maxStageVideoChannelUsers: number | undefined;
    public readonly approximateMemberCount: number | undefined;
    public readonly approximatePresenceCount: number | undefined;
    public readonly welcomeScreen: LilyGuild.WelcomeScreenStructure | undefined;
    public readonly nsfwLevel: GuildNSFWLevel;
    public readonly stickers: Array<Sticker.Structure>;
    public readonly premiumProgressBarEnabled: boolean;
    public readonly safetyAlertsChannelId: string | null;

    public readonly client: Client;

    public constructor(client: Client, guild: LilyGuild.Structure) {
        this.client = client;

        this.id = guild.id;
        this.name = guild.name;
        this.icon = guild.icon;
        this.iconHash = guild.icon_hash;
        this.splash = guild.splash;
        this.discoverySplash = guild.discovery_splash;
        this.owner = guild.owner;
        this.ownerId = guild.owner_id;
        this.permissions = guild.permissions;
        this.afkChannelId = guild.afk_channel_id;
        this.afkTimeout = guild.afk_timeout;
        this.widgetEnabled = guild.widget_enabled;
        this.widgetChannelId = guild.widget_channel_id;
        this.verificationLevel = guild.verification_level;
        this.defaultMessageNotifications = guild.default_message_notifications;
        this.explicitContentFilter = guild.explicit_content_filter;
        this.roles = guild.roles;
        this.emojis = guild.emojis;
        this.features = guild.features;
        this.mfaLevel = guild.mfa_level;
        this.applicationId = guild.application_id;
        this.systemChannelId = guild.system_channel_id;
        this.systemChannelFlags = guild.system_channel_flags;
        this.rulesChannelId = guild.rules_channel_id;
        this.maxPresences = guild.max_presences;
        this.maxMembers = guild.max_members;
        this.vanityUrlCode = guild.vanity_url_code;
        this.description = guild.description;
        this.banner = guild.banner;
        this.premiumTier = guild.premium_tier;
        this.premiumSubscriptionCount = guild.premium_subscription_count ?? 0;
        this.preferredLocale = guild.preferred_locale;
        this.publicUpdatesChannelId = guild.public_updates_channel_id;
        this.maxVideoChannelUsers = guild.max_video_channel_users;
        this.maxStageVideoChannelUsers = guild.max_stage_video_channel_users;
        this.approximateMemberCount = guild.approximate_member_count;
        this.approximatePresenceCount = guild.approximate_presence_count;
        this.welcomeScreen = guild.welcome_screen;
        this.nsfwLevel = guild.nsfw_level;
        this.stickers = guild.stickers ?? [];
        this.premiumProgressBarEnabled = guild.premium_progress_bar_enabled;
        this.safetyAlertsChannelId = guild.safety_alerts_channel_id;
    }
}

export class NewGuild extends Guild {
    public readonly joinedAt: string;
    public readonly large: boolean;
    public readonly unavailable: boolean;
    public readonly memberCount: number;
    public readonly voiceStates: Array<Partial<Voice.StateStructure>>;
    public readonly members: Array<GuildMember>;
    public readonly channels: Array<Channel>;
    public readonly threads: Array<Channel>;
    public readonly presences: Array<Partial<PresenceUpdateEventFields>>;
    public readonly stageInstances: Array<StageInstance.Structure>;
    public readonly guildScheduledEvents: Array<LilyGuild.ScheduledEventStructure>;

    public constructor(client: Client, guild: LilyGuild.New) {
        super(client, guild);

        this.joinedAt = guild.joined_at;
        this.large = guild.large;
        this.unavailable = guild.unavailable ?? false;
        this.memberCount = guild.member_count;
        this.voiceStates = guild.voice_states;
        this.members = guild.members.map((member) => new GuildMember(client, member));
        this.channels = guild.channels.map((channel) => channelFactory(client, channel));
        this.threads = guild.threads.map((channel) => channelFactory(client, channel));
        this.presences = guild.presences;
        this.stageInstances = guild.stage_instances;
        this.guildScheduledEvents = guild.guild_scheduled_events;
    }
}
