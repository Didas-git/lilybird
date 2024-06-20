import { GuildMember } from "./guild-member.js";
import { Message } from "./message.js";
import { User } from "./user.js";

import { ChannelType, VideoQualityMode, MessageFlags } from "lilybird";

import type {
    Channel as LilyChannel,
    Message as LilyMessage,
    LilybirdAttachment,
    ForumLayoutType,
    SortOrderType,
    Client
} from "lilybird";

// eslint-disable-next-line @typescript-eslint/ban-types
export type PartialChannel<T extends Channel = Channel> = Partial<T> & { [K in keyof Channel as Channel[K] extends Function ? K : never]: Channel[K] };
export interface ResolvedChannel extends Channel {
    permissions: string;
}

export function channelFactory(client: Client, channel: LilyChannel.Structure): Channel;
export function channelFactory(client: Client, channel: Partial<LilyChannel.Structure>): PartialChannel;
export function channelFactory(client: Client, channel: LilyChannel.Structure, resolved: true): ResolvedChannel;
export function channelFactory(client: Client, channel: LilyChannel.Structure | Partial<LilyChannel.Structure>, resolved = false): Channel | PartialChannel | ResolvedChannel {
    if (typeof channel.type === "undefined") throw new Error("Cannot parse invalid channel. Missing channel type");

    switch (channel.type) {
        case ChannelType.GUILD_TEXT: {
            return new GuildTextChannel(client, <never>channel, resolved);
        }
        case ChannelType.DM: {
            return new DMChannel(client, <never>channel, resolved);
        }
        case ChannelType.GUILD_VOICE: {
            return new GuildVoiceChannel(client, <never>channel, resolved);
        }
        case ChannelType.GROUP_DM: {
            return new GroupDMChannel(client, <never>channel, resolved);
        }
        case ChannelType.GUILD_ANNOUNCEMENT: {
            return new GuildAnnouncementChannel(client, <never>channel, resolved);
        }
        case ChannelType.GUILD_CATEGORY: {
            return new GuildChannelCategory(client, <never>channel, resolved);
        }
        case ChannelType.ANNOUNCEMENT_THREAD:
        case ChannelType.PUBLIC_THREAD:
        case ChannelType.PRIVATE_THREAD: {
            return new ThreadChannel(client, <never>channel, resolved);
        }
        case ChannelType.GUILD_STAGE_VOICE:
        case ChannelType.GUILD_DIRECTORY: {
            return new GuildChannel(client, <never>channel, resolved);
        }
        case ChannelType.GUILD_FORUM:
        case ChannelType.GUILD_MEDIA: {
            return new ThreadLikeChannel(client, <never>channel, resolved);
        }
    }
}

export interface MessageSendOptions extends LilyMessage.CreateJSONParams {
    tts?: boolean;
    suppressEmbeds?: boolean;
    suppressNotifications?: boolean;
}

export class Channel {
    public readonly id: string;
    public readonly type: ChannelType;
    public readonly lastPinTimestamp: string | null | undefined;
    public readonly flags: number;

    public readonly client: Client;

    public constructor(client: Client, channel: LilyChannel.Structure, resolved: boolean) {
        this.client = client;

        this.id = channel.id;
        this.type = channel.type;
        this.lastPinTimestamp = channel.last_pin_timestamp;
        this.flags = channel.flags ?? 0;

        if (resolved)
            if (typeof channel.permissions !== "undefined") (<ResolvedChannel>(<unknown> this)).permissions = channel.permissions;
    }

    public async send(content: string, options?: MessageSendOptions): Promise<Message>;
    public async send(options: MessageSendOptions): Promise<Message>;
    public async send(content: string | MessageSendOptions, options?: MessageSendOptions): Promise<Message> {
        let flags = 0;
        let data: LilyMessage.CreateJSONParams;
        let files: Array<LilybirdAttachment> | undefined;

        if (typeof content === "string") {
            if (typeof options !== "undefined") {
                const { suppressEmbeds, suppressNotifications, files: f, ...obj } = options;

                if (suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;
                if (suppressNotifications) flags |= MessageFlags.SUPPRESS_NOTIFICATIONS;

                files = f;
                data = {
                    ...obj,
                    content
                };
            } else data = { content };
        } else {
            const { suppressEmbeds, suppressNotifications, files: f, ...obj } = content;

            if (suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;
            if (suppressNotifications) flags |= MessageFlags.SUPPRESS_NOTIFICATIONS;

            files = f;
            data = obj;
        }

        return new Message(
            this.client,
            await this.client.rest.createMessage(this.id, {
                ...data,
                flags
            }, files)
        );
    }

    public isText(): this is GuildTextChannel {
        return this.type === ChannelType.GUILD_TEXT;
    }

    public isDM(): this is DMChannel {
        return this.type === ChannelType.DM;
    }

    public isVoice(): this is GuildVoiceChannel {
        return this.type === ChannelType.GUILD_VOICE;
    }

    public isGroupDM(): this is GroupDMChannel {
        return this.type === ChannelType.GROUP_DM;
    }

    public isCategory(): this is GuildChannelCategory {
        return this.type === ChannelType.GUILD_CATEGORY;
    }

    public isAnnouncement(): this is GuildAnnouncementChannel {
        return this.type === ChannelType.GUILD_ANNOUNCEMENT;
    }

    public isAnnouncementThread(): this is ThreadChannel {
        return this.type === ChannelType.ANNOUNCEMENT_THREAD;
    }

    public isPublicThread(): this is ThreadChannel {
        return this.type === ChannelType.PUBLIC_THREAD;
    }

    public isPrivateThread(): this is ThreadChannel {
        return this.type === ChannelType.PRIVATE_THREAD;
    }

    public isStageVoice(): this is GuildChannel {
        return this.type === ChannelType.GUILD_STAGE_VOICE;
    }

    public isDirectory(): this is GuildChannel {
        return this.type === ChannelType.GUILD_DIRECTORY;
    }

    public isForum(): this is ThreadLikeChannel {
        return this.type === ChannelType.GUILD_FORUM;
    }

    public isMedia(): this is ThreadLikeChannel {
        return this.type === ChannelType.GUILD_MEDIA;
    }
}

export class MentionChannel extends Channel {
    public readonly guildId: string;
    public readonly name: string;

    public constructor(client: Client, channel: LilyChannel.MentionStructure) {
        super(client, <never>channel, false);

        this.guildId = channel.guild_id;
        this.name = channel.name;
    }
}

export class GuildChannel extends Channel {
    public readonly guildId: string;
    public readonly name: string;
    public readonly position: number;
    public readonly permissionOverwrites: Array<LilyChannel.OverwriteStructure>;
    public readonly nsfw: boolean;
    public readonly topic: string | null;
    public readonly lastMessageId: string | null;
    public readonly parentId: string | null;
    public readonly defaultAutoArchiveDuration: LilyChannel.AutoArchiveDuration;

    public constructor(client: Client, channel: LilyChannel.BaseGuildChannelStructure, resolved: boolean) {
        super(client, <never>channel, resolved);

        this.guildId = channel.guild_id;
        this.name = channel.name;
        this.position = channel.position;
        this.permissionOverwrites = channel.permission_overwrites;
        this.nsfw = channel.nsfw;
        this.topic = channel.topic;
        this.lastMessageId = channel.last_message_id;
        this.parentId = channel.parent_id;
        this.defaultAutoArchiveDuration = channel.default_auto_archive_duration;
    }
}

export class GuildTextChannel extends GuildChannel {
    public readonly rateLimitPerUser: number;

    public constructor(client: Client, channel: LilyChannel.GuildTextChannelStructure, resolved: boolean) {
        super(client, channel, resolved);

        this.rateLimitPerUser = channel.rate_limit_per_user;
    }
}

export class GuildAnnouncementChannel extends GuildChannel {}

export class GuildVoiceChannel extends Channel {
    public readonly guildId: string;
    public readonly name: string;
    public readonly position: number;
    public readonly permissionOverwrites: Array<LilyChannel.OverwriteStructure>;
    public readonly lastMessageId: string | null;
    public readonly parentId: string | null;
    public readonly nsfw: boolean;
    public readonly rateLimitPerUser: number;
    public readonly rtcRegion: string | null;
    public readonly userLimit: number;
    public readonly bitrate: number;
    public readonly videoQualityMode: VideoQualityMode;

    public constructor(client: Client, channel: LilyChannel.GuildVoiceChannelStructure, resolved: boolean) {
        super(client, channel, resolved);

        this.guildId = channel.guild_id;
        this.name = channel.name;
        this.position = channel.position;
        this.permissionOverwrites = channel.permission_overwrites;
        this.lastMessageId = channel.last_message_id;
        this.parentId = channel.parent_id;
        this.nsfw = channel.nsfw;
        this.rateLimitPerUser = channel.rate_limit_per_user;
        this.rtcRegion = channel.rtc_region;
        this.userLimit = channel.user_limit;
        this.bitrate = channel.bitrate;
        this.videoQualityMode = channel.video_quality_mode ?? VideoQualityMode.AUTO;
    }
}

export class DMChannel extends Channel {
    public readonly lastMessageId: string | null;
    public readonly recipients: Array<User>;

    public constructor(client: Client, channel: LilyChannel.DMChannelStructure, resolved: boolean) {
        super(client, channel, resolved);

        this.lastMessageId = channel.last_message_id;
        this.recipients = channel.recipients.map((user) => new User(client, user));
    }
}

export class GroupDMChannel extends DMChannel {
    public readonly name: string;
    public readonly icon: string | null;
    public readonly ownerId: string;
    public readonly applicationId: string | undefined;
    public readonly managed: boolean | undefined;

    public constructor(client: Client, channel: LilyChannel.GroupDMChannelStructure, resolved: boolean) {
        super(client, <never>channel, resolved);

        this.name = channel.name;
        this.icon = channel.icon;
        this.ownerId = channel.owner_id;
        this.applicationId = channel.application_id;
        this.managed = channel.managed;
    }

    public isManaged(): this is GroupDMChannel & { readonly applicationId: string, readonly managed: true } {
        return !!this.managed;
    }
}

export class GuildChannelCategory extends Channel {
    public readonly permissionOverwrites: Array<LilyChannel.OverwriteStructure>;
    public readonly name: string;
    public readonly nsfw: boolean;
    public readonly position: number;
    public readonly guildId: string;
    public readonly rateLimitPerUser: number;

    public constructor(client: Client, channel: LilyChannel.CategoryStructure, resolved: boolean) {
        super(client, channel, resolved);

        this.permissionOverwrites = channel.permission_overwrites;
        this.name = channel.name;
        this.nsfw = channel.nsfw;
        this.position = channel.position;
        this.guildId = channel.guild_id;
        this.rateLimitPerUser = channel.rate_limit_per_user;
    }
}

export interface ExtendedThreadChannel extends ThreadChannel {
    readonly newlyCreated: boolean;
}

export class ThreadChannel extends Channel {
    public readonly guildId: string;
    public readonly parentId: string | null;
    public readonly ownerId: string;
    public readonly name: string;
    public readonly lastMessageId: string | null;
    public readonly messageCount: number;
    public readonly memberCount: number;
    public readonly threadMetadata: LilyChannel.ThreadMetadataStructure;
    public readonly totalMessageSent: number;
    public readonly member: ThreadMember | undefined;
    public readonly defaultThreadRateLimitPerUser: number;

    public constructor(client: Client, channel: LilyChannel.ThreadChannelStructure, resolved: boolean) {
        super(client, channel, resolved);

        this.guildId = channel.guild_id;
        this.parentId = channel.parent_id;
        this.ownerId = channel.owner_id;
        this.name = channel.name;
        this.lastMessageId = channel.last_message_id;
        this.messageCount = channel.message_count;
        this.memberCount = channel.member_count;
        this.threadMetadata = channel.thread_metadata;
        this.totalMessageSent = channel.total_message_sent;
        this.defaultThreadRateLimitPerUser = channel.default_thread_rate_limit_per_user ?? 0;

        if (typeof channel.member !== "undefined") this.member = new ThreadMember(client, channel.member);
        //@ts-expect-error I know its readonly but this is the constructor
        if ("newly_created" in channel) (<ExtendedThreadChannel><unknown> this).newlyCreated = <boolean>channel.newly_created;
    }

    public hasMember(): this is ThreadChannel & { member: ThreadMember } {
        return typeof this.member !== "undefined";
    }
}

export class ThreadMember {
    public readonly id: string | undefined;
    public readonly userId: string | undefined;
    public readonly joinTimestamp: Date;
    public readonly flags: number;
    public readonly member: GuildMember | undefined;

    public constructor(client: Client, member: LilyChannel.ThreadMemberStructure) {
        this.id = member.id;
        this.userId = member.user_id;
        this.joinTimestamp = new Date(member.join_timestamp);
        this.flags = member.flags;

        if (typeof member.member !== "undefined") this.member = new GuildMember(client, member.member);
    }
}

export class ThreadLikeChannel extends Channel {
    public readonly availableTags: Array<LilyChannel.ForumTagStructure> | undefined;
    public readonly appliedTags: Array<string> | undefined;
    public readonly defaultThreadRateLimitPerUser: number | undefined;
    public readonly defaultSortOrder: SortOrderType | null | undefined;
    public readonly defaultForumLayout: ForumLayoutType | undefined;
    public readonly defaultReactionEmoji: LilyChannel.DefaultReactionStructure | null | undefined;

    public constructor(client: Client, channel: LilyChannel.ThreadLikeChannelStructure, resolved: boolean) {
        super(client, channel, resolved);

        this.availableTags = channel.available_tags;
        this.appliedTags = channel.applied_tags;
        this.defaultThreadRateLimitPerUser = channel.default_thread_rate_limit_per_user;
        this.defaultSortOrder = channel.default_sort_order;
        this.defaultForumLayout = channel.default_forum_layout;
        this.defaultReactionEmoji = channel.default_reaction_emoji;
    }
}
