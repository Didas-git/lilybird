//@ts-expect-error We don't want the package.json being added to dist
import packageJson from "../../package.json" with { type: "json" };
import { DebugIdentifier } from "#enums";

import type { AuditLogEvent, MFALevel, OnboardingMode, PrivacyLevel } from "#enums";
import type {
    ListArchivedThreadsReturnStructure,
    GetGatewayBotResponse,
    ApplicationCommand,
    LilybirdAttachment,
    AutoModeration,
    DebugFunction,
    StageInstance,
    Application,
    Interaction,
    AuditLog,
    Channel,
    Message,
    Sticker,
    Webhook,
    Invite,
    Emoji,
    Guild,
    Voice,
    Role,
    User
} from "../typings/index.js";
import type { Poll } from "src/typings/poll.js";

export interface DiscordErrorMessage {
    code: number;
    message: string;
    /** Discord's own words: `a complete list of errors is not feasible and would be almost instantly out of date` */
    errors?: Record<string, unknown>;
}

export class RestError extends Error {
    public readonly code: number;
    public readonly errors: DiscordErrorMessage["errors"];

    public constructor(error: DiscordErrorMessage) {
        super(error.message);

        this.code = error.code;
        this.errors = error.errors;
    }
}

// I ran out of ideas for naming this thing
type ExtractedData = ({ data: { attachments: Array<unknown> | undefined } } | { attachments: Array<unknown> | undefined }) & { reason?: string };

export class REST {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public static readonly BaseURL = "https://discord.com/api/v10/";

    #token?: string | undefined;

    public constructor(token?: string) {
        this.#token = token;
    }

    public async makeAPIRequest<T>(method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT", path: string, data: FormData, reason?: string): Promise<T>;
    public async makeAPIRequest<T>(method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT", path: string, data?: Record<string, any>, files?: Array<LilybirdAttachment>): Promise<T>;
    public async makeAPIRequest<T>(method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT", path: string, data?: Record<string, any> | FormData, filesOrReason?: string | Array<LilybirdAttachment>): Promise<T> {
        const opts: RequestInit = {
            method,
            headers: {
                Authorization: `Bot ${this.#token}`,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "User-Agent": `DiscordBot/LilyBird/${(<{ version: string }>packageJson).version}`
            }
        };

        if (data instanceof FormData) {
            opts.body = data;
            if (typeof filesOrReason !== "undefined") {
                // @ts-expect-error No comments
                opts.headers["X-Audit-Log-Reason"] = filesOrReason;
            }
        } else if (typeof data !== "undefined") {
            let reason: string | undefined;
            let obj: ExtractedData;
            if ("reason" in data) ({ reason, ...obj } = data as ExtractedData);
            else obj = data as never;

            if (typeof filesOrReason !== "undefined" && typeof filesOrReason !== "string" && filesOrReason.length > 0) {
                const temp: Array<Partial<Channel.AttachmentStructure>> = [];
                const form = new FormData();

                for (let i = 0, { length } = filesOrReason; i < length; i++) {
                    form.append(`files[${i}]`, filesOrReason[i].file, filesOrReason[i].name);
                    temp.push({
                        id: i,
                        filename: filesOrReason[i].name
                    });
                }

                if ("data" in obj) obj.data.attachments = [...temp, ...obj.data.attachments ?? []];
                else obj.attachments = [...temp, ...obj.attachments ?? []];
                form.append("payload_json", JSON.stringify(obj));

                opts.body = form;
            } else {
                // @ts-expect-error No comments
                opts.headers["Content-Type"] = "application/json";
                opts.body = JSON.stringify(data);
            }

            if (typeof reason !== "undefined") {
                // @ts-expect-error No comments
                opts.headers["X-Audit-Log-Reason"] = reason;
            }
        }

        const response = await fetch(`${REST.BaseURL}${path}`, opts);

        if (!response.ok) {
            const errorMessage: DiscordErrorMessage = await response.json() as never;
            throw new RestError(errorMessage);
        }

        /*
            This assertion is a bit dangerous to make
            but since this is internal we should be fine
        */
        if (response.status === 204) return <T>null;

        return <T> await response.json();
    }

    public setToken(token: string | undefined): void {
        this.#token = token;
    }

    //#region Gateway
    public async getGateway(): Promise<{ url: string }> {
        return this.makeAPIRequest("GET", "gateway");
    }

    public async getGatewayBot(): Promise<GetGatewayBotResponse> {
        return this.makeAPIRequest("GET", "gateway/bot");
    }

    //#endregion Gateway
    //#region Application Commands
    public async getGlobalApplicationCommands(clientId: string): Promise<Array<ApplicationCommand.GlobalStructure>>;
    public async getGlobalApplicationCommands(clientId: string, withLocalizations: true): Promise<Array<ApplicationCommand.Localized.GlobalStructure>>;
    public async getGlobalApplicationCommands(clientId: string, withLocalizations = false): Promise<Array<ApplicationCommand.Localized.GlobalStructure | ApplicationCommand.GlobalStructure>> {
        return this.makeAPIRequest("GET", `applications/${clientId}/commands?with_localizations=${withLocalizations}`);
    }

    public async createGlobalApplicationCommand(clientId: string, body: ApplicationCommand.Create.ApplicationCommandJSONParams): Promise<ApplicationCommand.Localizations.GlobalStructure> {
        return this.makeAPIRequest("POST", `applications/${clientId}/commands`, body);
    }

    public async getGlobalApplicationCommand(clientId: string, commandId: string): Promise<ApplicationCommand.Localizations.GlobalStructure> {
        return this.makeAPIRequest("GET", `applications/${clientId}/commands/${commandId}`);
    }

    public async editGlobalApplicationCommand(
        clientId: string,
        commandId: string,
        body: Partial<ApplicationCommand.Create.ApplicationCommandJSONParams>
    ): Promise<ApplicationCommand.Localizations.GlobalStructure> {
        return this.makeAPIRequest("PATCH", `applications/${clientId}/commands/${commandId}`, body);
    }

    public async deleteGlobalApplicationCommand(clientId: string, commandId: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `applications/${clientId}/commands/${commandId}`);
    }

    public async bulkOverwriteGlobalApplicationCommand(clientId: string, body: Array<ApplicationCommand.Create.ApplicationCommandJSONParams>): Promise<Array<ApplicationCommand.Localizations.GlobalStructure>> {
        return this.makeAPIRequest("PUT", `applications/${clientId}/commands`, body);
    }

    public async getGuildApplicationCommands(clientId: string): Promise<Array<ApplicationCommand.GuildStructure>>;
    public async getGuildApplicationCommands(clientId: string, withLocalizations: true): Promise<Array<ApplicationCommand.Localized.GuildStructure>>;
    public async getGuildApplicationCommands(clientId: string, withLocalizations = false): Promise<Array<ApplicationCommand.Localized.GuildStructure | ApplicationCommand.GuildStructure>> {
        return this.makeAPIRequest("GET", `applications/${clientId}/commands?with_localizations=${withLocalizations}`);
    }

    public async createGuildApplicationCommand(clientId: string, guildId: string, body: ApplicationCommand.Create.ApplicationCommandJSONParams): Promise<ApplicationCommand.Localizations.GuildStructure> {
        return this.makeAPIRequest("POST", `applications/${clientId}/guilds/${guildId}/commands`, body);
    }

    public async getGuildApplicationCommand(clientId: string, guildId: string, commandId: string): Promise<ApplicationCommand.Localizations.GuildStructure> {
        return this.makeAPIRequest("POST", `applications/${clientId}/guilds/${guildId}/commands/${commandId}`);
    }

    public async editGuildApplicationCommand(
        clientId: string,
        guildId: string,
        commandId: string,
        body: Partial<ApplicationCommand.Create.ApplicationCommandJSONParams>
    ): Promise<ApplicationCommand.Localizations.GuildStructure> {
        return this.makeAPIRequest("PATCH", `applications/${clientId}/guilds/${guildId}/commands/${commandId}`, body);
    }

    public async deleteGuildApplicationCommand(clientId: string, guildId: string, commandId: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `applications/${clientId}/guilds/${guildId}/commands/${commandId}`);
    }

    public async bulkOverwriteGuildApplicationCommand(
        clientId: string,
        guildId: string,
        body: Array<ApplicationCommand.Create.ApplicationCommandJSONParams>
    ): Promise<Array<ApplicationCommand.Localizations.GuildStructure>> {
        return this.makeAPIRequest("PATCH", `applications/${clientId}/guilds/${guildId}/commands`, body);
    }

    public async getGuildApplicationCommandPermissions(clientId: string, guildId: string): Promise<Array<ApplicationCommand.GuildPermissionsStructure>> {
        return this.makeAPIRequest("GET", `applications/${clientId}/guilds/${guildId}/commands/permissions`);
    }

    public async getApplicationCommandPermissions(clientId: string, guildId: string, commandId: string): Promise<ApplicationCommand.GuildPermissionsStructure> {
        return this.makeAPIRequest("GET", `applications/${clientId}/guilds/${guildId}/commands/${commandId}/permissions`);
    }

    public async editApplicationCommandPermissions(
        clientId: string,
        guildId: string,
        commandId: string,
        body: { permissions: Array<ApplicationCommand.PermissionsStructure> }
    ): Promise<ApplicationCommand.GuildPermissionsStructure> {
        return this.makeAPIRequest("PATCH", `applications/${clientId}/guilds/${guildId}/commands/${commandId}/permissions`, body);
    }

    //#endregion Application Commands
    //#region Interactions
    public async createInteractionResponse(interactionId: string, interactionToken: string, body: Interaction.ResponseJSONParams, files?: Array<LilybirdAttachment>): Promise<null> {
        return this.makeAPIRequest("POST", `interactions/${interactionId}/${interactionToken}/callback`, body, files);
    }

    public async getOriginalInteractionResponse(clientId: string, interactionToken: string): Promise<Message.Structure> {
        return this.makeAPIRequest("GET", `webhooks/${clientId}/${interactionToken}/messages/@original`);
    }

    public async editOriginalInteractionResponse(clientId: string, interactionToken: string, body: Webhook.EditWebhookJSONParams, files?: Array<LilybirdAttachment>): Promise<Message.Structure> {
        return this.makeAPIRequest("PATCH", `webhooks/${clientId}/${interactionToken}/messages/@original`, body, files);
    }

    public async deleteOriginalInteractionResponse(clientId: string, interactionToken: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `webhooks/${clientId}/${interactionToken}/messages/@original`);
    }

    public async createFollowupMessage(clientId: string, interactionToken: string, body: Webhook.ExecuteWebhookJSONParams, files?: Array<LilybirdAttachment>): Promise<Message.Structure> {
        return this.makeAPIRequest("POST", `webhooks/${clientId}/${interactionToken}`, body, files);
    }

    public async getFollowupMessage(clientId: string, interactionToken: string, messageId: string): Promise<Message.Structure> {
        return this.makeAPIRequest("GET", `webhooks/${clientId}/${interactionToken}/messages/${messageId}`);
    }

    public async editFollowupMessage(clientId: string, interactionToken: string, messageId: string, body: Webhook.EditWebhookJSONParams, files?: Array<LilybirdAttachment>): Promise<Message.Structure> {
        return this.makeAPIRequest("PATCH", `webhooks/${clientId}/${interactionToken}/messages/${messageId}`, body, files);
    }

    public async deleteFollowupMessage(clientId: string, interactionToken: string, messageId: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `webhooks/${clientId}/${interactionToken}/messages/${messageId}`);
    }

    //#endregion Interactions
    //#region Application
    public async getCurrentApplication(): Promise<Application.Structure> {
        return this.makeAPIRequest("GET", "applications/@me");
    }

    public async editCurrentApplication(app: Application.EditApplicationJSONParams): Promise<Application.Structure> {
        return this.makeAPIRequest("PATCH", "applications/@me", app);
    }

    //#endregion Application
    //#region Application Role Connection Metadata
    public async getApplicationRoleConnectionMetadataRecords(applicationId: string): Promise<Array<Application.RoleConnectionMetadataStructure>> {
        return this.makeAPIRequest("GET", `applications/${applicationId}/role-connections/metadata`);
    }

    public async updateApplicationRoleConnectionMetadataRecords(applicationId: string): Promise<Array<Application.RoleConnectionMetadataStructure>> {
        return this.makeAPIRequest("PUT", `applications/${applicationId}/role-connections/metadata`);
    }

    //#endregion
    //#region Audit Log
    public async getGuildAuditLog(guildId: string, params: {
        user_id?: string,
        action_type?: AuditLogEvent,
        before?: string,
        after?: string,
        limit?: number
    }): Promise<AuditLog.Structure> {
        let url = `guilds/${guildId}/audit-logs?`;
        if (typeof params.user_id !== "undefined")
            url += `user_id=${params.user_id}&`;

        if (typeof params.action_type !== "undefined")
            url += `action_type=${params.action_type}&`;

        if (typeof params.before !== "undefined")
            url += `before=${params.before}&`;

        if (typeof params.after !== "undefined")
            url += `after=${params.after}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.makeAPIRequest("GET", url);
    }

    //#endregion Audit Log
    //#region Auto Moderation
    public async listAutoModerationRulesForGuild(guildId: string): Promise<Array<AutoModeration.RuleStructure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/auto-moderation/rules`);
    }

    public async getAutoModerationRule(guildId: string, ruleId: string): Promise<AutoModeration.RuleStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/auto-moderation/rules/${ruleId}`);
    }

    public async createAutoModerationRule(guildId: string, rule: AutoModeration.CreateJSONParams): Promise<AutoModeration.RuleStructure> {
        return this.makeAPIRequest("POST", `guilds/${guildId}/auto-moderation/rules`, rule);
    }

    public async modifyAutoModerationRule(guildId: string, ruleId: string, rule: Partial<Omit<AutoModeration.CreateJSONParams, "trigger_type">>): Promise<AutoModeration.RuleStructure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/auto-moderation/rules/${ruleId}`, rule);
    }

    public async deleteAutoModerationRule(guildId: string, ruleId: string, reason: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `guilds/${guildId}/auto-moderation/rules/${ruleId}`, { reason });
    }

    //#endregion
    //#region Channel
    public async getChannel(channelId: string): Promise<Channel.Structure> {
        return this.makeAPIRequest("GET", `channels/${channelId}`);
    }

    public async modifyChannel(channelId: string, body: Channel.Modify.GuildChannelStructure | Channel.Modify.DMChannelStructure | Channel.Modify.ThreadChannelStructure): Promise<Channel.Structure> {
        return this.makeAPIRequest("PATCH", `channels/${channelId}`, body);
    }

    public async deleteChannel(channelId: string, reason?: string): Promise<Channel.Structure> {
        return this.makeAPIRequest("DELETE", `channels/${channelId}`, { reason });
    }

    public async getChannelMessages(
        channelId: string,
        params: {
            around?: string,
            before?: string,
            after?: string,
            /**
             * 0-100
             * @default 50
             */
            limit?: number
        }
    ): Promise<Array<Message.Structure>> {
        let url = `channels/${channelId}/messages?`;
        if (typeof params.around !== "undefined")
            url += `around=${params.around}&`;

        if (typeof params.before !== "undefined")
            url += `before=${params.before}&`;

        if (typeof params.after !== "undefined")
            url += `after=${params.after}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.makeAPIRequest("GET", url);
    }

    public async getChannelMessage(channelId: string, messageId: string): Promise<Message.Structure> {
        return this.makeAPIRequest("GET", `channels/${channelId}/messages/${messageId}`);
    }

    public async createMessage(channelId: string, body: Message.CreateJSONParams, files?: Array<LilybirdAttachment>): Promise<Message.Structure> {
        return this.makeAPIRequest("POST", `channels/${channelId}/messages`, body, files);
    }

    public async crosspostMessage(channelId: string, messageId: string): Promise<Message.Structure> {
        return this.makeAPIRequest("POST", `channels/${channelId}/messages/${messageId}/crosspost`);
    }

    public async createReaction(channelId: string, messageId: string, emoji: string, isCustom = false): Promise<null> {
        if (!isCustom) emoji = encodeURIComponent(emoji);
        return this.makeAPIRequest("PUT", `channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`);
    }

    public async deleteOwnReaction(channelId: string, messageId: string, emoji: string, isCustom = false): Promise<null> {
        if (!isCustom) emoji = encodeURIComponent(emoji);
        return this.makeAPIRequest("DELETE", `channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`);
    }

    public async deleteUserReaction(channelId: string, messageId: string, userId: string, emoji: string, isCustom = false): Promise<null> {
        if (!isCustom) emoji = encodeURIComponent(emoji);
        return this.makeAPIRequest("DELETE", `channels/${channelId}/messages/${messageId}/reactions/${emoji}/${userId}`);
    }

    public async getReactions(channelId: string, messageId: string, emoji: string, isCustom = false, params: { after?: number, limit?: string } = {}): Promise<Array<User.Structure>> {
        if (!isCustom) emoji = encodeURIComponent(emoji);

        let url = `channels/${channelId}/messages/${messageId}/reactions/${emoji}?`;
        if (typeof params.after !== "undefined")
            url += `after=${params.after}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.makeAPIRequest("GET", url);
    }

    public async deleteAllReactions(channelId: string, messageId: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `channels/${channelId}/messages/${messageId}/reactions`);
    }

    public async deleteAllReactionsForEmoji(channelId: string, messageId: string, emoji: string, isCustom = false): Promise<null> {
        if (!isCustom) emoji = encodeURIComponent(emoji);
        return this.makeAPIRequest("DELETE", `channels/${channelId}/messages/${messageId}/reactions/${emoji}`);
    }

    public async editMessage(channelId: string, messageId: string, body: Message.EditJSONParams, files?: Array<LilybirdAttachment>): Promise<Message.Structure> {
        return this.makeAPIRequest("PATCH", `channels/${channelId}/messages/${messageId}`, body, files);
    }

    public async deleteMessage(channelId: string, messageId: string, reason?: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `channels/${channelId}/messages/${messageId}`, { reason });
    }

    public async bulkDeleteMessages(channelId: string, messageIds: Array<string>, reason?: string): Promise<null> {
        return this.makeAPIRequest("POST", `channels/${channelId}/messages/bulk-delete`, { messages: messageIds, reason });
    }

    public async editChannelPermissions(
        channelId: string,
        overwriteId: string,
        params: {
            reason?: string,
            allow?: string | null,
            deny?: string | null,
            /** 0 for a role or 1 for a member */
            type: 0 | 1
        }
    ): Promise<null> {
        return this.makeAPIRequest("PUT", `channels/${channelId}/permissions/${overwriteId}`, params);
    }

    public async getChannelInvites(channelId: string): Promise<Array<Invite.Structure>> {
        return this.makeAPIRequest("GET", `channels/${channelId}/invites`);
    }

    public async createChannelInvite(channelId: string, body: Invite.CreateJSONParams): Promise<Invite.Structure> {
        return this.makeAPIRequest("POST", `channels/${channelId}/invites`, body);
    }

    public async deleteChannelPermission(channelId: string, overwriteId: string, reason?: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `channels/${channelId}/permissions/${overwriteId}`, { reason });
    }

    public async followAnnouncementChannel(channelId: string, body: { webhook_channel_id?: string }): Promise<Channel.FollowedChannelStructure> {
        return this.makeAPIRequest("DELETE", `channels/${channelId}/followers`, body);
    }

    public async triggerTypingIndicator(channelId: string): Promise<null> {
        return this.makeAPIRequest("POST", `channels/${channelId}/typing`);
    }

    public async getPinnedMessages(channelId: string): Promise<null> {
        return this.makeAPIRequest("GET", `channels/${channelId}/pins`);
    }

    public async pinMessage(channelId: string, messageId: string, reason?: string): Promise<null> {
        return this.makeAPIRequest("PUT", `channels/${channelId}/pins/${messageId}`, { reason });
    }

    public async unpinMessage(channelId: string, messageId: string, reason?: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `channels/${channelId}/pins/${messageId}`, { reason });
    }

    public async groupDMAddRecipient(channelId: string, userId: string, body: { access_token: string, nick: string }): Promise<null> {
        return this.makeAPIRequest("PUT", `channels/${channelId}/recipients/${userId}`, body);
    }

    public async groupDMRemoveRecipient(channelId: string, userId: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `channels/${channelId}/recipients/${userId}`);
    }

    public async startThreadFromMessage(channelId: string, messageId: string, body: Channel.Create.ThreadFromMessageJSONParams): Promise<Channel.Structure> {
        return this.makeAPIRequest("POST", `channels/${channelId}/messages/${messageId}/threads`, body);
    }

    public async startThreadWithoutMessage(channelId: string, body: Channel.Create.ThreadJSONParams): Promise<Channel.Structure> {
        return this.makeAPIRequest("POST", `channels/${channelId}/threads`, body);
    }

    public async startThreadInForumOrMediaChannel(channelId: string, body: Channel.Create.ForumMediaThreadJSONParams, files?: Array<LilybirdAttachment>): Promise<Channel.Structure> {
        return this.makeAPIRequest("POST", `channels/${channelId}/threads`, body, files);
    }

    public async joinThread(channelId: string): Promise<null> {
        return this.makeAPIRequest("PUT", `channels/${channelId}/thread-members/@me`);
    }

    public async addThreadMember(channelId: string, userId: string): Promise<null> {
        return this.makeAPIRequest("PUT", `channels/${channelId}/thread-members/${userId}`);
    }

    public async leaveThread(channelId: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `channels/${channelId}/thread-members/@me`);
    }

    public async removeThreadMember(channelId: string, userId: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `channels/${channelId}/thread-members/${userId}`);
    }

    public async getThreadMember(channelId: string, userId: string, withMember = false): Promise<Channel.ThreadMemberStructure> {
        return this.makeAPIRequest("GET", `channels/${channelId}/thread-members/${userId}?with_member=${withMember}`);
    }

    public async listThreadMembers(channelId: string, params: { after?: number, limit?: string } = {}): Promise<Array<Channel.ThreadMemberStructure>> {
        let url = `channels/${channelId}/thread-members`;
        if (typeof params.after !== "undefined")
            url += `after=${params.after}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.makeAPIRequest("GET", url);
    }

    public async listPublicArchivedThreads(channelId: string, params: { before?: /* ISO8601 Timestamp */ string, limit?: string } = {}): Promise<ListArchivedThreadsReturnStructure> {
        let url = `channels/${channelId}/threads/archived/public`;
        if (typeof params.before !== "undefined")
            url += `before=${params.before}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.makeAPIRequest("GET", url);
    }

    public async listPrivateArchivedThreads(channelId: string, params: { before?: /* ISO8601 Timestamp */ string, limit?: string } = {}): Promise<ListArchivedThreadsReturnStructure> {
        let url = `channels/${channelId}/threads/archived/private`;
        if (typeof params.before !== "undefined")
            url += `before=${params.before}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.makeAPIRequest("GET", url);
    }

    public async listJoinedPrivateArchivedThreads(channelId: string, params: { before?: /* ISO8601 Timestamp */ string, limit?: string } = {}): Promise<ListArchivedThreadsReturnStructure> {
        let url = `channels/${channelId}/users/@me/threads/archived/private`;
        if (typeof params.before !== "undefined")
            url += `before=${params.before}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.makeAPIRequest("GET", url);
    }

    //#endregion Channel
    //#region Emoji
    public async listGuildEmojis(guildId: string): Promise<Array<Emoji.Structure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/emojis`);
    }

    public async getGuildEmoji(guildId: string, emojiId: string): Promise<Emoji.Structure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/emojis/${emojiId}`);
    }

    public async createGuildEmoji(guildId: string, params: { name: string, image: ImageData, roles: Array<string>, reason?: string }): Promise<Emoji.Structure> {
        return this.makeAPIRequest("POST", `guilds/${guildId}/emojis`, params);
    }

    public async modifyGuildEmoji(guildId: string, emojiId: string, params: { name?: string, roles?: Array<string> | null, reason: string }): Promise<Emoji.Structure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/emojis/${emojiId}`, params);
    }

    public async deleteGuildEmoji(guildId: string, emojiId: string, reason?: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `guilds/${guildId}/emojis/${emojiId}`, { reason });
    }

    //#endregion Emoji
    //#region Guild
    public async createGuild(body: Guild.Create.GuildJSONParams): Promise<Guild.Structure> {
        return this.makeAPIRequest("POST", "guilds", body);
    }

    public async getGuild(guildId: string, withCounts = false): Promise<Guild.Structure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}?with_counts=${withCounts}`);
    }

    public async getGuildPreview(guildId: string): Promise<Guild.PreviewStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/preview`);
    }

    public async modifyGuild(guildId: string, body: Guild.Modify.GuildJSONParams): Promise<Guild.Structure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}`, body);
    }

    public async deleteGuild(guildId: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `guilds/${guildId}`);
    }

    public async getGuildChannels(guildId: string): Promise<Array<Channel.Structure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/channels`);
    }

    public async createGuildChannel(guildId: string, body: Guild.Create.GuildChannelJSONParams): Promise<Channel.Structure> {
        return this.makeAPIRequest("POST", `guilds/${guildId}/channels`, body);
    }

    public async modifyGuildChannelPositions(guildId: string, body: Array<Guild.Modify.ChannelPositionJSONParams>): Promise<Channel.Structure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/channels`, body);
    }

    public async listActiveGuildThreads(guildId: string): Promise<{
        threads: Array<Channel.ThreadChannelStructure>,
        members: Array<Channel.ThreadMemberStructure>
    }> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/threads/active`);
    }

    public async getGuildMember(guildId: string, userId: string): Promise<Guild.MemberStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/members/${userId}`);
    }

    public async listGuildMembers(guildId: string, params: { limit: number, after: string }): Promise<Array<Guild.MemberStructure>> {
        let url = `guilds/${guildId}/members`;
        if (typeof params.after !== "undefined")
            url += `after=${params.after}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.makeAPIRequest("GET", url);
    }

    public async searchGuildMembers(guildId: string, params: { query: string, limit: number }): Promise<Array<Guild.MemberStructure>> {
        let url = `guilds/${guildId}/members/search`;
        if (typeof params.query !== "undefined")
            url += `query=${params.query}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.makeAPIRequest("GET", url);
    }

    public async addGuildMember(
        guildId: string,
        userId: string,
        body: {
            access_token: string,
            nick?: string,
            roles?: Array<string>,
            mute?: boolean,
            deaf?: boolean
        }
    ): Promise<Guild.MemberStructure | null> {
        return this.makeAPIRequest("PUT", `guilds/${guildId}/members/${userId}`, body);
    }

    public async modifyGuildMember(
        guildId: string,
        userId: string,
        body: {
            reason?: string | null,
            nick?: string | null,
            roles?: Array<string> | null,
            mute?: boolean | null,
            deaf?: boolean | null,
            channel_id?: string | null,
            /** ISO8601 timestamp */
            communication_disabled_until?: string | null,
            flags?: number | null
        }
    ): Promise<Guild.MemberStructure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/members/${userId}`, body);
    }

    public async modifyCurrentMember(
        guildId: string,
        body: {
            reason?: string | null,
            nick?: string | null
        }
    ): Promise<Guild.MemberStructure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/members/@me`, body);
    }

    public async addGuildMemberRole(guildId: string, userId: string, roleId: string, reason: string): Promise<null> {
        return this.makeAPIRequest("PUT", `guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
    }

    public async removeGuildMemberRole(guildId: string, userId: string, roleId: string, reason: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
    }

    public async removeGuildMember(guildId: string, userId: string, reason: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `guilds/${guildId}/members/${userId}`, { reason });
    }

    public async getGuildBans(
        guildId: string,
        params: {
            before: string,
            after: string,
            limit: string
        }
    ): Promise<Array<Guild.BanStructure>> {
        let url = `guilds/${guildId}/bans`;
        if (typeof params.before !== "undefined")
            url += `before=${params.before}&`;

        if (typeof params.after !== "undefined")
            url += `after=${params.after}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.makeAPIRequest("GET", url);
    }

    public async getGuildBan(guildId: string, userId: string): Promise<Guild.BanStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/bans/${userId}`);
    }

    public async createGuildBan(
        guildId: string,
        userId: string,
        body: {
            reason?: string,
            delete_message_seconds?: number
        }
    ): Promise<null> {
        return this.makeAPIRequest("PUT", `guilds/${guildId}/bans/${userId}`, body);
    }

    public async removeGuildBan(guildId: string, userId: string, reason?: string): Promise<null> {
        return this.makeAPIRequest("PUT", `guilds/${guildId}/bans/${userId}`, { reason });
    }

    public async getGuildRoles(guildId: string): Promise<Array<Role.Structure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/roles`);
    }

    public async createGuildRole(guildId: string, body: Role.JSONParams): Promise<Role.Structure> {
        return this.makeAPIRequest("POST", `guilds/${guildId}/roles`, body);
    }

    public async modifyGuildRolePosition(guildId: string, body: { reason?: string, id: string, position?: number | null }): Promise<Array<Role.Structure>> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/roles`, body);
    }

    public async modifyGuildRole(guildId: string, roleId: string, body: Partial<Role.JSONParams>): Promise<Role.Structure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/roles/${roleId}`, body);
    }

    public async modifyGuildMFALevel(guildId: string, level: MFALevel): Promise<MFALevel> {
        return this.makeAPIRequest("POST", `guilds/${guildId}/mfa`, { level });
    }

    public async deleteGuildRole(guildId: string, roleId: string, reason?: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `guilds/${guildId}/roles/${roleId}`, { reason });
    }

    public async getGuildPruneCount(guildId: string, params: { days: number, include_roles?: string }): Promise<{ pruned: number }> {
        let url = `guilds/${guildId}/prune`;
        if (typeof params.days !== "undefined")
            url += `days=${params.days}&`;

        if (typeof params.include_roles !== "undefined")
            url += `include_roles=${params.include_roles}`;

        return this.makeAPIRequest("GET", url);
    }

    public async beginGuildPrune(
        guildId: string,
        body: {
            days?: number,
            compute_prune_count?: boolean,
            include_roles?: Array<string>,
            reason?: string
        }
    ): Promise<{ pruned: number | null }> {
        return this.makeAPIRequest("POST", `guilds/${guildId}/prune`, body);
    }

    public async getGuildVoiceRegions(guildId: string): Promise<Array<Voice.RegionStructure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/regions`);
    }

    public async getGuildInvites(guildId: string): Promise<Array<Invite.Structure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/invites`);
    }

    public async getGuildIntegrations(guildId: string): Promise<Array<Guild.IntegrationStructure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/integrations`);
    }

    public async deleteGuildIntegration(guildId: string, integrationId: string, reason?: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `guilds/${guildId}/integrations/${integrationId}`, { reason });
    }

    public async getGuildWidgetSettings(guildId: string): Promise<Guild.WidgetSettingsStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/widget`);
    }

    public async modifyGuildWidget(guildId: string, body: Guild.WidgetSettingsStructure & { reason?: string }): Promise<Guild.WidgetSettingsStructure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/widget`, body);
    }

    public async getGuildWidget(guildId: string): Promise<Guild.WidgetStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/widget.json`);
    }

    public async getGuildVanityUrl(guildId: string): Promise<Partial<Invite.Structure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/vanity-url`);
    }

    /** Yeah... this probably doesn't work */
    public async getGuildWidgetImage(guildId: string, style = "shield"): Promise<string> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/widget.png?style=${style}`);
    }

    public async getGuildWelcomeScreen(guildId: string): Promise<Guild.WelcomeScreenStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/welcome-screen`);
    }

    public async modifyGuildWelcomeScreen(
        guildId: string,
        body: {
            reason?: string,
            enabled?: boolean | null,
            welcome_channels?: Array<Guild.WelcomeScreenChannelStructure> | null,
            description?: string | null
        }
    ): Promise<Guild.WelcomeScreenStructure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/welcome-screen`, body);
    }

    public async getGuildOnboarding(guildId: string): Promise<Guild.OnboardingStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/onboarding`);
    }

    public async modifyGuildOnboarding(
        guildId: string,
        body: {
            reason?: string,
            prompts: Array<Guild.OnboardingPromptStructure>,
            default_channel_ids: Array<string>,
            enabled: boolean,
            mode: OnboardingMode
        }
    ): Promise<Guild.OnboardingStructure> {
        return this.makeAPIRequest("PUT", `guilds/${guildId}/onboarding`, body);
    }

    public async modifyCurrentUserVoiceState(
        guildId: string,
        body: {
            channel_id?: string,
            suppress?: boolean,
            request_to_speak_timestamp?: string | null
        }
    ): Promise<null> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/voice-states/@me`, body);
    }

    public async modifyUserVoiceState(
        guildId: string,
        userId: string,
        body: {
            channel_id: string,
            suppress?: boolean
        }
    ): Promise<null> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/voice-states/${userId}`, body);
    }

    //#endregion Guild
    //#region Guild Scheduled Event
    public async listScheduledEventsForGuild(guildId: string, params: { with_user_count?: boolean }): Promise<Array<Guild.ScheduledEventStructure>> {
        let url = `guilds/${guildId}/scheduled-events?`;
        if (typeof params.with_user_count !== "undefined")
            url += `with_user_count=${params.with_user_count}`;

        return this.makeAPIRequest("GET", url);
    }

    public async createGuildScheduledEvent(guildId: string, event: Guild.Create.ScheduledEventJSONParams): Promise<Guild.ScheduledEventStructure> {
        return this.makeAPIRequest("POST", `guilds/${guildId}/scheduled-events`, event);
    }

    public async getGuildScheduledEvent(guildId: string, eventId: string, params: { with_user_count?: boolean }): Promise<Array<Guild.ScheduledEventStructure>> {
        let url = `guilds/${guildId}/scheduled-events/${eventId}?`;
        if (typeof params.with_user_count !== "undefined")
            url += `with_user_count=${params.with_user_count}`;

        return this.makeAPIRequest("GET", url);
    }

    public async modifyGuildScheduledEvent(guildId: string, eventId: string, event: Partial<Guild.Create.ScheduledEventJSONParams>): Promise<Guild.ScheduledEventStructure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/scheduled-events/${eventId}`, event);
    }

    public async deleteGuildScheduledEvent(guildId: string, eventId: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `guilds/${guildId}/scheduled-events/${eventId}`);
    }

    public async getGuildScheduledEventUsers(guildId: string, eventId: string, params: {
        limit?: number,
        with_member?: boolean,
        before?: string,
        after?: string
    }): Promise<{ guild_scheduled_event_id: string, user: User.Structure, member?: Guild.MemberStructure }> {
        let url = `guilds/${guildId}/scheduled-events/${eventId}?`;
        if (typeof params.with_member !== "undefined")
            url += `with_member=${params.with_member}&`;

        if (typeof params.before !== "undefined")
            url += `before=${params.before}&`;

        if (typeof params.after !== "undefined")
            url += `after=${params.after}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.makeAPIRequest("DELETE", url);
    }

    //#endregion
    //#region Guild Template
    public async getGuildTemplate(templateCode: string): Promise<Guild.TemplateStructure> {
        return this.makeAPIRequest("GET", `guilds/templates/${templateCode}`);
    }

    public async createGuildFromGuildTemplate(templateCode: string, guild: { name: string, image?: ImageData }): Promise<Guild.Structure> {
        return this.makeAPIRequest("POST", `guilds/templates/${templateCode}`, guild);
    }

    public async getGuildTemplates(guildId: string): Promise<Array<Guild.TemplateStructure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/templates`);
    }

    public async createGuildTemplate(guildId: string, template: { name: string, description?: string | null }): Promise<Guild.TemplateStructure> {
        return this.makeAPIRequest("POST", `guilds/${guildId}/templates`, template);
    }

    public async syncGuildTemplate(guildId: string, templateCode: string): Promise<Array<Guild.TemplateStructure>> {
        return this.makeAPIRequest("PUT", `guilds/${guildId}/templates/${templateCode}`);
    }

    public async modifyGuildTemplate(guildId: string, templateCode: string, template: { name?: string, description?: string | null }): Promise<Guild.TemplateStructure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/templates/${templateCode}`, template);
    }

    public async deleteGuildTemplate(guildId: string, templateCode: string): Promise<Guild.TemplateStructure> {
        return this.makeAPIRequest("DELETE", `guilds/${guildId}/templates/${templateCode}`);
    }

    //#endregion
    //#region Invite
    public async getInvite(inviteCode: string): Promise<Invite.Structure> {
        return this.makeAPIRequest("GET", `invites/${inviteCode}`);
    }

    public async deleteInvite(inviteCode: string, reason?: string): Promise<Invite.Structure> {
        return this.makeAPIRequest("DELETE", `invites/${inviteCode}`, { reason });
    }

    //#endregion Invite
    //#region Poll
    public async getAnswerVoters(
        channelId: string,
        messageId: string,
        answerId: number,
        params: {
            after?: string,
            /**
             * 0-100
             * @default 25
             */
            limit?: number
        }
    ): Promise<Poll.AnswerVotersStructure> {
        let url = `channels/${channelId}/polls/${messageId}/answers/${answerId}?`;
        if (typeof params.after !== "undefined")
            url += `after=${params.after}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.makeAPIRequest("GET", url);
    }

    public async endPoll(channelId: string, messageId: string): Promise<Message.Structure> {
        return this.makeAPIRequest("POST", `channels/${channelId}/polls/${messageId}/expire`);
    }

    //#endregion
    //#region Stage Instance
    public async createStageInstance(instance: StageInstance.CreateJSONParams): Promise<StageInstance.Structure> {
        return this.makeAPIRequest("POST", "stage-instances", instance);
    }

    public async getStageInstance(channelId: string): Promise<StageInstance.Structure> {
        return this.makeAPIRequest("GET", `stage-instances/${channelId}`);
    }

    public async modifyStageInstance(channelId: string, data: { topic?: string, privacy_level?: PrivacyLevel, reason?: string }): Promise<StageInstance.Structure> {
        return this.makeAPIRequest("PATCH", `stage-instances/${channelId}`, data);
    }

    public async deleteStageInstance(channelId: string, reason?: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `stage-instances/${channelId}`, { reason });
    }

    //#endregion
    //#region Sticker
    public async getSticker(stickerId: string): Promise<Sticker.Structure> {
        return this.makeAPIRequest("GET", `stickers/${stickerId}`);
    }

    public async listStickerPacks(): Promise<{ sticker_packs: Array<Sticker.PackStructure> }> {
        return this.makeAPIRequest("GET", "sticker-packs");
    }

    public async listGuildStickers(guildId: string): Promise<Array<Sticker.Structure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/stickers`);
    }

    public async getGuildSticker(guildId: string, stickerId: string): Promise<Sticker.Structure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/stickers/${stickerId}`);
    }

    public async createGuildSticker(guildId: string, stickerId: string, params: { name: string, description: string, tags: string, file: Blob, reason?: string }): Promise<Sticker.Structure> {
        const form = new FormData();
        const { reason, ...obj }: { reason?: string } & Record<string, string | Blob> = params;
        for (const key in obj) form.append(key, obj[key]);

        return this.makeAPIRequest("POST", `guilds/${guildId}/stickers/${stickerId}`, form, reason);
    }

    public async modifyGuildSticker(guildId: string, stickerId: string, params: { name?: string, description?: string, tags?: string, reason?: string }): Promise<Sticker.Structure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/stickers/${stickerId}`, params);
    }

    public async deleteGuildSticker(guildId: string, stickerId: string, reason?: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `guilds/${guildId}/stickers/${stickerId}`, { reason });
    }

    //#endregion Sticker
    //#region User
    public async getCurrentUser(): Promise<User.Structure> {
        return this.makeAPIRequest("GET", "users/@me");
    }

    public async getUser(userId: string): Promise<User.Structure> {
        return this.makeAPIRequest("GET", `users/${userId}`);
    }

    public async modifyCurrentUser(body?: { username?: string, avatar?: /** Image Data */ string }): Promise<User.Structure> {
        return this.makeAPIRequest("PATCH", "users/@me", body);
    }

    public async getCurrentUserGuilds(params: {
        before: string,
        after: string,
        limit: string,
        withCounts: boolean
    }): Promise<Array<Partial<Guild.Structure>>> {
        let url = "users/@me/guilds?";
        if (typeof params.withCounts !== "undefined")
            url += `with_counts=${params.withCounts}&`;

        if (typeof params.before !== "undefined")
            url += `before=${params.before}&`;

        if (typeof params.after !== "undefined")
            url += `after=${params.after}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.makeAPIRequest("GET", url);
    }

    public async getCurrentUserGuildMember(guildId: string): Promise<Guild.MemberStructure> {
        return this.makeAPIRequest("GET", `users/@me/guilds/${guildId}/member`);
    }

    public async leaveGuild(guildId: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `users/@me/guilds/${guildId}`);
    }

    public async createDM(userId: string): Promise<Channel.DMChannelStructure> {
        return this.makeAPIRequest("POST", "users/@me/channels", { recipient_id: userId });
    }

    public async createGroupDM(tokens: Array<string>, nicks: Record<string, string>): Promise<Channel.DMChannelStructure> {
        return this.makeAPIRequest("POST", "users/@me/channels", { access_tokens: tokens, nicks });
    }

    //#endregion User
    //#region Voice
    public async listVoiceRegions(): Promise<Array<Voice.RegionStructure>> {
        return this.makeAPIRequest("GET", "voice/regions");
    }

    //#endregion
    //#region Webhook
    public async createWebhook(channelId: string, webhook: { name: string, avatar?: ImageData | null }): Promise<Webhook.Structure> {
        return this.makeAPIRequest("POST", `channels/${channelId}/webhooks`, webhook);
    }

    public async getChannelWebhooks(channelId: string): Promise<Array<Webhook.Structure>> {
        return this.makeAPIRequest("GET", `channels/${channelId}/webhooks`);
    }

    public async getGuildWebhooks(guildId: string): Promise<Array<Webhook.Structure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/webhooks`);
    }

    public async getWebhook(webhookId: string): Promise<Webhook.Structure> {
        return this.makeAPIRequest("GET", `webhooks/${webhookId}`);
    }

    public async getWebhookWithToken(webhookId: string, token: string): Promise<Webhook.Structure> {
        return this.makeAPIRequest("GET", `webhooks/${webhookId}/${token}`);
    }

    public async modifyWebhook(webhookId: string, webhook: { name?: string, avatar?: ImageData | null, channel_id?: string, reason?: string }): Promise<Webhook.Structure> {
        return this.makeAPIRequest("PATCH", `webhooks/${webhookId}`, webhook);
    }

    public async modifyWebhookWithToken(webhookId: string, token: string, webhook: {
        name?: string,
        avatar?: ImageData | null,
        channel_id?: string, reason?: string
    }): Promise<Webhook.Structure> {
        return this.makeAPIRequest("PATCH", `webhooks/${webhookId}/${token}`, webhook);
    }

    public async deleteWebhook(webhookId: string, reason?: string): Promise<Webhook.Structure> {
        return this.makeAPIRequest("DELETE", `webhooks/${webhookId}`, { reason });
    }

    public async deleteWebhookWithToken(webhookId: string, token: string, reason?: string): Promise<Webhook.Structure> {
        return this.makeAPIRequest("DELETE", `webhooks/${webhookId}/${token}`, { reason });
    }

    public async executeWebhook(
        webhookId: string,
        token: string,
        params: { wait?: boolean, thread_id?: string },
        body: Webhook.ExecuteWebhookJSONParams,
        files?: Array<LilybirdAttachment>
    ): Promise<Message.Structure | null> {
        let url = `webhooks/${webhookId}/${token}?`;

        if (typeof params.wait !== "undefined")
            url += `wait=${params.wait}&`;

        if (typeof params.thread_id !== "undefined")
            url += `thread_id=${params.thread_id}&`;

        return this.makeAPIRequest("POST", url, body, files);
    }

    public async getWebhookMessage(webhookId: string, token: string, messageId: string, params: { thread_id?: string }): Promise<Message.Structure> {
        let url = `webhooks/${webhookId}/${token}/messages/${messageId}?`;

        if (typeof params.thread_id !== "undefined")
            url += `thread_id=${params.thread_id}`;

        return this.makeAPIRequest("GET", url);
    }

    public async editWebhookMessage(
        webhookId: string,
        token: string,
        messageId: string,
        params: { thread_id?: string },
        body: Webhook.EditWebhookJSONParams,
        files?: Array<LilybirdAttachment>
    ): Promise<Message.Structure> {
        let url = `webhooks/${webhookId}/${token}/messages/${messageId}?`;

        if (typeof params.thread_id !== "undefined")
            url += `thread_id=${params.thread_id}`;

        return this.makeAPIRequest("PATCH", url, body, files);
    }

    public async deleteWebhookMessage(webhookId: string, token: string, messageId: string, params: { thread_id?: string }): Promise<null> {
        let url = `webhooks/${webhookId}/${token}/messages/${messageId}?`;

        if (typeof params.thread_id !== "undefined")
            url += `thread_id=${params.thread_id}`;

        return this.makeAPIRequest("DELETE", url);
    }
    //#endregion
}

export class DebugREST extends REST {
    readonly #debug: DebugFunction;

    public constructor(debug?: DebugFunction, token?: string) {
        super(token);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.#debug = debug ?? (() => {});
    }

    public override async makeAPIRequest<T>(method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT", path: string, data: FormData, reason?: string | undefined): Promise<T>;
    public override async makeAPIRequest<T>(method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT", path: string, data?: Record<string, any> | undefined, files?: Array<LilybirdAttachment> | undefined): Promise<T>;
    public override async makeAPIRequest<T>(
        method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT",
        path: string,
        data?: FormData | Record<string, any> | undefined,
        filesOrReason?: string | Array<LilybirdAttachment> | undefined
    ): Promise<T> {
        this.#debug(DebugIdentifier.RESTCall, { method, path, data, filesOrReason });
        try {
            return await super.makeAPIRequest(<never>method, <never>path, <never> data, <never>filesOrReason);
        } catch (e) {
            this.#debug(DebugIdentifier.RESTError, e);
            throw e;
        }
    }
}
