import type { Channel } from "./channel.js";
import type { Guild } from "./guild.js";
import type { Message } from "./message.js";
import type { Role } from "./role.js";
import type { User } from "./user.js";

export interface ResolvedDataStructure {
    users?: Record<string, User.Structure>;
    members?: Record<string, Omit<Guild.MemberStructure, "user" | "deaf" | "mute">>;
    roles?: Record<string, Role.Structure>;
    channels?: Record<string, Pick<Channel.ThreadChannelStructure, "id" | "name" | "type" | "permissions" | "thread_metadata" | "parent_id">>;
    messages?: Record<string, Partial<Message.Structure>>;
    attachments?: Record<string, Channel.AttachmentStructure>;
}

export interface LilybirdAttachment {
    file: Blob;
    name: string;
}

export interface ListArchivedThreadsReturnStructure {
    threads: Array<Channel.Structure>;
    members: Array<Channel.ThreadMemberStructure>;
    has_more: boolean;
}
