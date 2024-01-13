import type { AuditLogEvent } from "#enums";

export interface AuditLogEntryStructure {
    target_id: string | null;
    changes?: Array<AuditLogChange>;
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

export interface AuditLogChange {
    new_value?: Record<string, unknown>;
    old_value?: Record<string, unknown>;
    key: string;
}
