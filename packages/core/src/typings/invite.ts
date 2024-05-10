import type { InviteTargetType } from "#enums";
import type { StageInstance } from "./stage-instance.js";
import type { Application } from "./application.js";
import type { Channel } from "./channel.js";
import type { Guild } from "./guild.js";
import type { User } from "./user.js";

export declare namespace Invite {
    export interface Structure {
        code: string;
        guild?: Partial<Guild.Structure>;
        channel: Partial<Channel.Structure> | null;
        inviter?: User.Structure;
        target_type?: InviteTargetType;
        target_user?: User.Structure;
        target_application?: Partial<Application.Structure>;
        approximate_presence_count?: number;
        approximate_member_count?: number;
        /** ISO8601 Timestamp */
        expires_at?: string;
        stage_instance?: StageInstance.Structure;
        guild_scheduled_event?: Guild.ScheduledEventStructure;
    }

    export interface Metadata extends Structure {
        uses: number;
        max_uses: number;
        max_age: number;
        temporary: boolean;
        /** ISO8601 Timestamp */
        created_at: string;
    }

    export interface CreateJSONParams {
        reason?: string;
        max_age?: number;
        max_uses?: number;
        temporary?: boolean;
        unique?: boolean;
        target_type?: InviteTargetType;
        target_user_id?: string;
        target_application_id?: string;
    }
}
