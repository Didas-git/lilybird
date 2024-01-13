import type { ApplicationCommandStructure } from "./interaction.js";
import type { ThreadChannelStructure, WebhookStructure } from "../index.js";

import type {
    AutoModerationRuleStructure,
    GuildScheduleEventStructure,
    AuditLogEntryStructure,
    IntegrationStructure,
    UserStructure
} from "../shared/index.js";

export interface AuditLogStructure {
    application_commands: Array<ApplicationCommandStructure>;
    audit_log_entries: Array<AuditLogEntryStructure>;
    auto_moderation_rules: Array<AutoModerationRuleStructure>;
    guild_scheduled_events: Array<GuildScheduleEventStructure>;
    integrations: Array<IntegrationStructure>;
    threads: Array<ThreadChannelStructure>;
    users: Array<UserStructure>;
    webhooks: Array<WebhookStructure>;
}
