import type { AllowedMentionsStructure, AttachmentStructure, EmbedStructure, OverwriteStructure } from "../shared";
import type { ChannelType, ForumLayoutType, InviteTargetType, SortOrderType, VideoQualityMode } from "../../enums";

import type { MessageComponentStructure, MessageReferenceStructure, DefaultReactionStructure, ThreadMemberStructure, AutoArchiveDuration, ForumTagStructure, ChannelStructure, Attachment } from "..";

export interface ModifyDMChannelStructure {
    name?: string;
    icon?: string;
}

export interface ModifyGuildChannelStructure {
    name?: string;
    type?: ChannelType.GUILD_TEXT | ChannelType.GUILD_ANNOUNCEMENT;
    position?: number | null;
    topic?: string | null;
    nsfw?: boolean | null;
    rate_limit_per_user?: number | null;
    bitrate?: number | null;
    user_limit?: number | null;
    permission_overwrites?: Array<Partial<OverwriteStructure>>;
    parent_id?: string | null;
    rtc_region?: string | null;
    video_quality_mode?: VideoQualityMode | null;
    default_auto_archive_duration?: number;
    flags?: number;
    available_tags?: Array<ForumTagStructure>;
    default_reaction_emoji?: DefaultReactionStructure | null;
    default_thread_rate_limit_per_user?: number;
    default_sort_order?: SortOrderType | null;
    default_forum_layout?: ForumLayoutType | null;
}

export interface ModifyThreadChannelStructure {
    name?: string;
    archived?: boolean;
    auto_archive_duration?: AutoArchiveDuration;
    locked?: boolean;
    invitable?: boolean;
    rate_limit_per_user?: number | null;
    flags?: number;
    applied_tags?: Array<string>;
}

export interface GetChannelMessagesStructure {
    around?: string;
    before?: string;
    after?: string;
    /**
     *  0-100
     * @defaultValue 50
     */
    limit?: number;
}

export interface CreateMessageStructure {
    content?: string;
    nonce?: number | string;
    tts?: boolean;
    embeds?: Array<EmbedStructure>;
    allowed_mentions?: AllowedMentionsStructure;
    message_reference?: MessageReferenceStructure;
    components?: Array<MessageComponentStructure>;
    sticker_ids?: Array<string>;
    files?: Array<Attachment>;
    payload_json?: string;
    attachments?: Array<Partial<AttachmentStructure>>;
    flags?: number;
}

export interface EditMessageStructure {
    content?: string;
    embeds?: Array<EmbedStructure>;
    flags?: number;
    allowed_mentions?: AllowedMentionsStructure;
    components?: Array<MessageComponentStructure>;
    files?: Array<Attachment>;
    payload_json?: string;
    attachments?: Array<AttachmentStructure>;
}

export interface CreateChannelInviteStructure {
    reason?: string;
    max_age?: number;
    max_uses?: number;
    temporary?: boolean;
    unique?: boolean;
    target_type?: InviteTargetType;
    target_user_id?: string;
    target_application_id?: string;
}

export interface FollowedChannelStructure {
    channel_id: string;
    webhook_id: string;
}

export interface CreateThreadFromMessageStructure {
    name: string;
    auto_archive_duration?: number;
    rate_limit_per_user?: number | null;
    reason?: string;
}

export interface CreateThreadStructure extends CreateThreadFromMessageStructure {
    /** https://discord.com/developers/docs/resources/channel#start-thread-without-message-json-params */
    type?: ChannelType;
    invitable?: boolean;
}

export interface CreateForumMediaThreadStructure extends CreateThreadFromMessageStructure {
    message: ForumThreadMessageParamsStructure;
    applied_tags?: Array<string>;
    files?: Array<Attachment>;
    payload_json?: string;
}

export interface ForumThreadMessageParamsStructure {
    content?: string;
    embeds?: Array<EmbedStructure>;
    allowed_mentions?: AllowedMentionsStructure;
    components?: Array<MessageComponentStructure>;
    sticker_ids?: Array<string>;
    attachments?: Array<Partial<AttachmentStructure>>;
    flags?: number;
}

export interface ListArchivedThreadsReturnStructure {
    threads: Array<ChannelStructure>;
    members: Array<ThreadMemberStructure>;
    has_more: boolean;
}
