import type { InviteTargetType } from "../../enums/index.js";

import type {
    GuildScheduleEventStructure,
    StageInstanceStructure,
    ApplicationStructure,
    ChannelStructure,
    GuildStructure,
    UserStructure
} from "../index.js";

export interface InviteStructure {
    code: string;
    guild?: Partial<GuildStructure>;
    channel: Partial<ChannelStructure> | null;
    inviter?: UserStructure;
    target_type?: InviteTargetType;
    target_user?: UserStructure;
    target_application?: Partial<ApplicationStructure>;
    approximate_presence_count?: number;
    approximate_member_count?: number;
    /** ISO8601 Timestamp */
    expires_at?: string;
    stage_instance?: StageInstanceStructure;
    guild_scheduled_event?: GuildScheduleEventStructure;
}

export interface InviteMetadata extends InviteStructure {
    uses: number;
    max_uses: number;
    max_age: number;
    temporary: boolean;
    /** ISO8601 Timestamp */
    created_at: string;
}
