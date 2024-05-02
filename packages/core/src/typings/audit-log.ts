import type { ApplicationCommand } from "./application-command.js";
import type { AutoModeration } from "./auto-moderation.js";
import type { AuditLogEvent } from "#enums";
import type { Channel } from "./channel.js";
import type { Webhook } from "./webhook.js";
import type { Guild } from "./guild.js";
import type { User } from "./user.js";

export declare namespace AuditLog {
    export interface Structure {
        application_commands: Array<ApplicationCommand.Structure>;
        audit_log_entries: Array<EntryStructure>;
        auto_moderation_rules: Array<AutoModeration.RuleStructure>;
        guild_scheduled_events: Array<Guild.ScheduledEventStructure>;
        integrations: Array<Guild.IntegrationStructure>;
        threads: Array<Channel.ThreadChannelStructure>;
        users: Array<User.Structure>;
        webhooks: Array<Webhook.Structure>;
    }

    export interface EntryStructure {
        target_id: string | null;
        changes?: Array<Change>;
        user_id: string | null;
        id: string;
        action_type: AuditLogEvent;
        options?: AuditEntryInfo;
        reason?: string;
    }

    export interface AuditEntryInfo {
        application_id: string;
        auto_moderation_rule_name: string;
        auto_moderation_rule_trigger_type: string;
        channel_id: string;
        count: string;
        delete_member_days: string;
        id: string;
        members_removed: string;
        message_id: string;
        role_name: string;
        type: string;
        integration_type: string;
    }

    export interface Change {
        new_value?: Record<string, unknown>;
        old_value?: Record<string, unknown>;
        key: string;
    }
}
