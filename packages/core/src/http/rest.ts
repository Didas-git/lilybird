//@ts-expect-error We don't want the package.json being added to dist
import { version } from "../../package.json" with { type: "json" };

import type { AuditLogEvent, MFALevel, OnboardingMode } from "#enums";

import type {
    LocalizationGlobalApplicationCommandStructure,
    LocalizationGuildApplicationCommandStructure,
    GuildApplicationCommandPermissionsStructure,
    LocalizedGlobalApplicationCommandStructure,
    LocalizedGuildApplicationCommandStructure,
    ApplicationCommandPermissionsStructure,
    ListArchivedThreadsReturnStructure,
    CreateThreadFromMessageStructure,
    POSTApplicationCommandStructure,
    CreateForumMediaThreadStructure,
    ModifyChannelPositionStructure,
    WelcomeScreenChannelStructure,
    InteractionResponseStructure,
    ModifyThreadChannelStructure,
    CreateChannelInviteStructure,
    GuildWidgetSettingsStructure,
    ModifyGuildChannelStructure,
    GetChannelMessagesStructure,
    CreateGuildChannelStructure,
    OnboardingPromptStructure,
    FollowedChannelStructure,
    ModifyDMChannelStructure,
    GuildOnboardingStructure,
    PATCHCurrentApplication,
    ExecuteWebhookStructure,
    CreateMessageStructure,
    ThreadChannelStructure,
    WelcomeScreenStructure,
    CreateThreadStructure,
    ThreadMemberStructure,
    GuildPreviewStructure,
    GetGatewayBotResponse,
    EditWebhookStructure,
    EditMessageStructure,
    GuildMemberStructure,
    CreateGuildStructure,
    ModifyGuildStructure,
    VoiceRegionStructure,
    IntegrationStructure,
    GuildWidgetStructure,
    ApplicationStructure,
    StickerPackStructure,
    AttachmentStructure,
    DMChannelStructure,
    LilybirdAttachment,
    AuditLogStructure,
    MessageStructure,
    ChannelStructure,
    APIRoleStructure,
    StickerStructure,
    InviteStructure,
    GuildStructure,
    EmojiStructure,
    UserStructure,
    RoleStructure,
    ErrorMessage,
    BanStructure,
    ImageData
} from "../typings/index.js";

export class RestError extends Error {
    public readonly code: number;
    public readonly errors: ErrorMessage["errors"];

    public constructor(error: ErrorMessage) {
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
                "User-Agent": `DiscordBot/LilyBird/${version}`
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
                const temp: Array<Partial<AttachmentStructure>> = [];
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
            const errorMessage: ErrorMessage = await response.json() as never;
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
    public async getGlobalApplicationCommands(clientId: string): Promise<Array<LocalizedGlobalApplicationCommandStructure>>;
    public async getGlobalApplicationCommands(clientId: string, withLocalizations: true): Promise<Array<LocalizationGlobalApplicationCommandStructure>>;
    public async getGlobalApplicationCommands(clientId: string, withLocalizations = false): Promise<Array<LocalizationGlobalApplicationCommandStructure | LocalizedGlobalApplicationCommandStructure>> {
        return this.makeAPIRequest("GET", `applications/${clientId}/commands?with_localizations=${withLocalizations}`);
    }

    public async createGlobalApplicationCommand(clientId: string, body: POSTApplicationCommandStructure): Promise<LocalizationGlobalApplicationCommandStructure> {
        return this.makeAPIRequest("POST", `applications/${clientId}/commands`, body);
    }

    public async getGlobalApplicationCommand(clientId: string, commandId: string): Promise<LocalizationGlobalApplicationCommandStructure> {
        return this.makeAPIRequest("GET", `applications/${clientId}/commands/${commandId}`);
    }

    public async editGlobalApplicationCommand(clientId: string, commandId: string, body: Partial<POSTApplicationCommandStructure>): Promise<LocalizationGlobalApplicationCommandStructure> {
        return this.makeAPIRequest("PATCH", `applications/${clientId}/commands/${commandId}`, body);
    }

    public async deleteGlobalApplicationCommand(clientId: string, commandId: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `applications/${clientId}/commands/${commandId}`);
    }

    public async bulkOverwriteGlobalApplicationCommand(clientId: string, body: Array<POSTApplicationCommandStructure>): Promise<Array<LocalizationGlobalApplicationCommandStructure>> {
        return this.makeAPIRequest("PUT", `applications/${clientId}/commands`, body);
    }

    public async getGuildApplicationCommands(clientId: string): Promise<Array<LocalizedGuildApplicationCommandStructure>>;
    public async getGuildApplicationCommands(clientId: string, withLocalizations: true): Promise<Array<LocalizationGuildApplicationCommandStructure>>;
    public async getGuildApplicationCommands(clientId: string, withLocalizations = false): Promise<Array<LocalizationGuildApplicationCommandStructure | LocalizedGuildApplicationCommandStructure>> {
        return this.makeAPIRequest("GET", `applications/${clientId}/commands?with_localizations=${withLocalizations}`);
    }

    public async createGuildApplicationCommand(clientId: string, guildId: string, body: POSTApplicationCommandStructure): Promise<LocalizationGuildApplicationCommandStructure> {
        return this.makeAPIRequest("POST", `applications/${clientId}/guilds/${guildId}/commands`, body);
    }

    public async getGuildApplicationCommand(clientId: string, guildId: string, commandId: string): Promise<LocalizationGuildApplicationCommandStructure> {
        return this.makeAPIRequest("POST", `applications/${clientId}/guilds/${guildId}/commands/${commandId}`);
    }

    public async editGuildApplicationCommand(clientId: string, guildId: string, commandId: string, body: Partial<POSTApplicationCommandStructure>): Promise<LocalizationGuildApplicationCommandStructure> {
        return this.makeAPIRequest("PATCH", `applications/${clientId}/guilds/${guildId}/commands/${commandId}`, body);
    }

    public async deleteGuildApplicationCommand(clientId: string, guildId: string, commandId: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `applications/${clientId}/guilds/${guildId}/commands/${commandId}`);
    }

    public async bulkOverwriteGuildApplicationCommand(clientId: string, guildId: string, body: Array<POSTApplicationCommandStructure>): Promise<Array<LocalizationGuildApplicationCommandStructure>> {
        return this.makeAPIRequest("PATCH", `applications/${clientId}/guilds/${guildId}/commands`, body);
    }

    public async getGuildApplicationCommandPermissions(clientId: string, guildId: string): Promise<Array<GuildApplicationCommandPermissionsStructure>> {
        return this.makeAPIRequest("GET", `applications/${clientId}/guilds/${guildId}/commands/permissions`);
    }

    public async getApplicationCommandPermissions(clientId: string, guildId: string, commandId: string): Promise<GuildApplicationCommandPermissionsStructure> {
        return this.makeAPIRequest("GET", `applications/${clientId}/guilds/${guildId}/commands/${commandId}/permissions`);
    }

    public async editApplicationCommandPermissions(
        clientId: string,
        guildId: string,
        commandId: string,
        body: { permissions: Array<ApplicationCommandPermissionsStructure> }
    ): Promise<GuildApplicationCommandPermissionsStructure> {
        return this.makeAPIRequest("PATCH", `applications/${clientId}/guilds/${guildId}/commands/${commandId}/permissions`, body);
    }

    //#endregion Application Commands
    //#region Interactions
    public async createInteractionResponse(interactionId: string, interactionToken: string, body: InteractionResponseStructure, files?: Array<LilybirdAttachment>): Promise<null> {
        return this.makeAPIRequest("POST", `interactions/${interactionId}/${interactionToken}/callback`, body, files);
    }

    public async getOriginalInteractionResponse(clientId: string, interactionToken: string): Promise<MessageStructure> {
        return this.makeAPIRequest("GET", `webhooks/${clientId}/${interactionToken}/messages/@original`);
    }

    public async editOriginalInteractionResponse(clientId: string, interactionToken: string, body: EditWebhookStructure, files?: Array<LilybirdAttachment>): Promise<MessageStructure> {
        return this.makeAPIRequest("PATCH", `webhooks/${clientId}/${interactionToken}/messages/@original`, body, files);
    }

    public async deleteOriginalInteractionResponse(clientId: string, interactionToken: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `webhooks/${clientId}/${interactionToken}/messages/@original`);
    }

    public async createFollowupMessage(clientId: string, interactionToken: string, body: ExecuteWebhookStructure, files?: Array<LilybirdAttachment>): Promise<MessageStructure> {
        return this.makeAPIRequest("POST", `webhooks/${clientId}/${interactionToken}`, body, files);
    }

    public async getFollowupMessage(clientId: string, interactionToken: string, messageId: string): Promise<MessageStructure> {
        return this.makeAPIRequest("GET", `webhooks/${clientId}/${interactionToken}/messages/${messageId}`);
    }

    public async editFollowupMessage(clientId: string, interactionToken: string, messageId: string, body: EditWebhookStructure, files?: Array<LilybirdAttachment>): Promise<MessageStructure> {
        return this.makeAPIRequest("PATCH", `webhooks/${clientId}/${interactionToken}/messages/${messageId}`, body, files);
    }

    public async deleteFollowupMessage(clientId: string, interactionToken: string, messageId: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `webhooks/${clientId}/${interactionToken}/messages/${messageId}`);
    }

    //#endregion Interactions
    //#region Application
    public async getCurrentApplication(): Promise<ApplicationStructure> {
        return this.makeAPIRequest("GET", "applications/@me");
    }

    public async editCurrentApplication(app: PATCHCurrentApplication): Promise<ApplicationStructure> {
        return this.makeAPIRequest("PATCH", "applications/@me", app);
    }

    //#endregion Application
    //#region Audit Log
    public async getGuildAuditLog(guildId: string, params: {
        user_id?: string,
        action_type?: AuditLogEvent,
        before?: string,
        after?: string,
        limit?: number
    }): Promise<AuditLogStructure> {
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
    //#region Channel
    public async getChannel(channelId: string): Promise<ChannelStructure> {
        return this.makeAPIRequest("GET", `channels/${channelId}`);
    }

    public async modifyChannel(channelId: string, body: ModifyGuildChannelStructure | ModifyDMChannelStructure | ModifyThreadChannelStructure): Promise<ChannelStructure> {
        return this.makeAPIRequest("PATCH", `channels/${channelId}`, body);
    }

    public async deleteChannel(channelId: string, reason?: string): Promise<ChannelStructure> {
        return this.makeAPIRequest("DELETE", `channels/${channelId}`, { reason });
    }

    public async getChannelMessages(channelId: string, params: GetChannelMessagesStructure): Promise<Array<MessageStructure>> {
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

    public async getChannelMessage(channelId: string, messageId: string): Promise<MessageStructure> {
        return this.makeAPIRequest("GET", `channels/${channelId}/messages/${messageId}`);
    }

    public async createMessage(channelId: string, body: CreateMessageStructure, files?: Array<LilybirdAttachment>): Promise<MessageStructure> {
        return this.makeAPIRequest("POST", `channels/${channelId}/messages`, body, files);
    }

    public async crosspostMessage(channelId: string, messageId: string): Promise<MessageStructure> {
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

    public async getReactions(channelId: string, messageId: string, emoji: string, isCustom = false, params: { after?: number, limit?: string } = {}): Promise<Array<UserStructure>> {
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

    public async editMessage(channelId: string, messageId: string, body: EditMessageStructure, files?: Array<LilybirdAttachment>): Promise<MessageStructure> {
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

    public async getChannelInvites(channelId: string): Promise<Array<InviteStructure>> {
        return this.makeAPIRequest("GET", `channels/${channelId}/invites`);
    }

    public async createChannelInvite(channelId: string, body: CreateChannelInviteStructure): Promise<InviteStructure> {
        return this.makeAPIRequest("POST", `channels/${channelId}/invites`, body);
    }

    public async deleteChannelPermission(channelId: string, overwriteId: string, reason?: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `channels/${channelId}/permissions/${overwriteId}`, { reason });
    }

    public async followAnnouncementChannel(channelId: string, body: { webhook_channel_id?: string }): Promise<FollowedChannelStructure> {
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

    public async startThreadFromMessage(channelId: string, messageId: string, body: CreateThreadFromMessageStructure): Promise<ChannelStructure> {
        return this.makeAPIRequest("POST", `channels/${channelId}/messages/${messageId}/threads`, body);
    }

    public async startThreadWithoutMessage(channelId: string, body: CreateThreadStructure): Promise<ChannelStructure> {
        return this.makeAPIRequest("POST", `channels/${channelId}/threads`, body);
    }

    public async startThreadInForumOrMediaChannel(channelId: string, body: CreateForumMediaThreadStructure, files?: Array<LilybirdAttachment>): Promise<ChannelStructure> {
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

    public async getThreadMember(channelId: string, userId: string, withMember = false): Promise<ThreadMemberStructure> {
        return this.makeAPIRequest("GET", `channels/${channelId}/thread-members/${userId}?with_member=${withMember}`);
    }

    public async listThreadMembers(channelId: string, params: { after?: number, limit?: string } = {}): Promise<Array<ThreadMemberStructure>> {
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
    public async listGuildEmojis(guildId: string): Promise<Array<EmojiStructure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/emojis`);
    }

    public async getGuildEmoji(guildId: string, emojiId: string): Promise<EmojiStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/emojis/${emojiId}`);
    }

    public async createGuildEmoji(guildId: string, params: { name: string, image: ImageData, roles: Array<string>, reason?: string }): Promise<EmojiStructure> {
        return this.makeAPIRequest("POST", `guilds/${guildId}/emojis`, params);
    }

    public async modifyGuildEmoji(guildId: string, emojiId: string, params: { name?: string, roles?: Array<string> | null, reason: string }): Promise<EmojiStructure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/emojis/${emojiId}`, params);
    }

    public async deleteGuildEmoji(guildId: string, emojiId: string, reason?: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `guilds/${guildId}/emojis/${emojiId}`, { reason });
    }

    //#endregion Emoji
    //#region Guild
    public async createGuild(body: CreateGuildStructure): Promise<GuildStructure> {
        return this.makeAPIRequest("POST", "guilds", body);
    }

    public async getGuild(guildId: string, withCounts = false): Promise<GuildStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}?with_counts=${withCounts}`);
    }

    public async getGuildPreview(guildId: string): Promise<GuildPreviewStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/preview`);
    }

    public async modifyGuild(guildId: string, body: ModifyGuildStructure): Promise<GuildStructure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}`, body);
    }

    public async deleteGuild(guildId: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `guilds/${guildId}`);
    }

    public async getGuildChannels(guildId: string): Promise<Array<ChannelStructure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/channels`);
    }

    public async createGuildChannel(guildId: string, body: CreateGuildChannelStructure): Promise<ChannelStructure> {
        return this.makeAPIRequest("POST", `guilds/${guildId}/channels`, body);
    }

    public async modifyGuildChannelPositions(guildId: string, body: Array<ModifyChannelPositionStructure>): Promise<ChannelStructure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/channels`, body);
    }

    public async listActiveGuildThreads(guildId: string): Promise<{
        threads: Array<ThreadChannelStructure>,
        members: Array<ThreadMemberStructure>
    }> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/threads/active`);
    }

    public async getGuildMember(guildId: string, userId: string): Promise<GuildMemberStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/members/${userId}`);
    }

    public async listGuildMembers(guildId: string, params: { limit: number, after: string }): Promise<Array<GuildMemberStructure>> {
        let url = `guilds/${guildId}/members`;
        if (typeof params.after !== "undefined")
            url += `after=${params.after}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.makeAPIRequest("GET", url);
    }

    public async searchGuildMembers(guildId: string, params: { query: string, limit: number }): Promise<Array<GuildMemberStructure>> {
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
    ): Promise<GuildMemberStructure | null> {
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
    ): Promise<GuildMemberStructure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/members/${userId}`, body);
    }

    public async modifyCurrentMember(
        guildId: string,
        body: {
            reason?: string | null,
            nick?: string | null
        }
    ): Promise<GuildMemberStructure> {
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
    ): Promise<Array<BanStructure>> {
        let url = `guilds/${guildId}/bans`;
        if (typeof params.before !== "undefined")
            url += `before=${params.before}&`;

        if (typeof params.after !== "undefined")
            url += `after=${params.after}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.makeAPIRequest("GET", url);
    }

    public async getGuildBan(guildId: string, userId: string): Promise<BanStructure> {
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

    public async getGuildRoles(guildId: string): Promise<Array<RoleStructure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/roles`);
    }

    public async createGuildRole(guildId: string, body: APIRoleStructure): Promise<RoleStructure> {
        return this.makeAPIRequest("POST", `guilds/${guildId}/roles`, body);
    }

    public async modifyGuildRolePosition(guildId: string, body: { reason?: string, id: string, position?: number | null }): Promise<Array<RoleStructure>> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/roles`, body);
    }

    public async modifyGuildRole(guildId: string, roleId: string, body: Partial<APIRoleStructure>): Promise<RoleStructure> {
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

    public async getGuildVoiceRegions(guildId: string): Promise<Array<VoiceRegionStructure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/regions`);
    }

    public async getGuildInvites(guildId: string): Promise<Array<InviteStructure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/invites`);
    }

    public async getGuildIntegrations(guildId: string): Promise<Array<IntegrationStructure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/integrations`);
    }

    public async deleteGuildIntegration(guildId: string, integrationId: string, reason?: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `guilds/${guildId}/integrations/${integrationId}`, { reason });
    }

    public async getGuildWidgetSettings(guildId: string): Promise<GuildWidgetSettingsStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/widget`);
    }

    public async modifyGuildWidget(guildId: string, body: GuildWidgetSettingsStructure & { reason?: string }): Promise<GuildWidgetSettingsStructure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/widget`, body);
    }

    public async getGuildWidget(guildId: string): Promise<GuildWidgetStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/widget.json`);
    }

    public async getGuildVanityUrl(guildId: string): Promise<Partial<InviteStructure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/vanity-url`);
    }

    /** Yeah... this probably doesn't work */
    public async getGuildWidgetImage(guildId: string, style = "shield"): Promise<string> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/widget.png?style=${style}`);
    }

    public async getGuildWelcomeScreen(guildId: string): Promise<WelcomeScreenStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/welcome-screen`);
    }

    public async modifyGuildWelcomeScreen(
        guildId: string,
        body: {
            reason?: string,
            enabled?: boolean | null,
            welcome_channels?: Array<WelcomeScreenChannelStructure> | null,
            description?: string | null
        }
    ): Promise<WelcomeScreenStructure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/welcome-screen`, body);
    }

    public async getGuildOnboarding(guildId: string): Promise<GuildOnboardingStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/onboarding`);
    }

    public async modifyGuildOnboarding(
        guildId: string,
        body: {
            reason?: string,
            prompts: Array<OnboardingPromptStructure>,
            default_channel_ids: Array<string>,
            enabled: boolean,
            mode: OnboardingMode
        }
    ): Promise<GuildOnboardingStructure> {
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
    //#region Invite
    public async getInvite(inviteCode: string): Promise<InviteStructure> {
        return this.makeAPIRequest("GET", `invites/${inviteCode}`);
    }

    public async deleteInvite(inviteCode: string, reason?: string): Promise<InviteStructure> {
        return this.makeAPIRequest("DELETE", `invites/${inviteCode}`, { reason });
    }

    //#endregion Invite
    //#region Sticker
    public async getSticker(stickerId: string): Promise<StickerStructure> {
        return this.makeAPIRequest("GET", `stickers/${stickerId}`);
    }

    public async listStickerPacks(): Promise<{ sticker_packs: Array<StickerPackStructure> }> {
        return this.makeAPIRequest("GET", "sticker-packs");
    }

    public async listGuildStickers(guildId: string): Promise<Array<StickerStructure>> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/stickers`);
    }

    public async getGuildSticker(guildId: string, stickerId: string): Promise<StickerStructure> {
        return this.makeAPIRequest("GET", `guilds/${guildId}/stickers/${stickerId}`);
    }

    public async createGuildSticker(guildId: string, stickerId: string, params: { name: string, description: string, tags: string, file: Blob, reason?: string }): Promise<StickerStructure> {
        const form = new FormData();
        const { reason, ...obj }: { reason?: string } & Record<string, string | Blob> = params;
        for (const key in obj) form.append(key, obj[key]);

        return this.makeAPIRequest("POST", `guilds/${guildId}/stickers/${stickerId}`, form, reason);
    }

    public async modifyGuildSticker(guildId: string, stickerId: string, params: { name?: string, description?: string, tags?: string, reason?: string }): Promise<StickerStructure> {
        return this.makeAPIRequest("PATCH", `guilds/${guildId}/stickers/${stickerId}`, params);
    }

    public async deleteGuildSticker(guildId: string, stickerId: string, reason?: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `guilds/${guildId}/stickers/${stickerId}`, { reason });
    }

    //#endregion Sticker
    //#region User
    public async getCurrentUser(): Promise<UserStructure> {
        return this.makeAPIRequest("GET", "users/@me");
    }

    public async getUser(userId: string): Promise<UserStructure> {
        return this.makeAPIRequest("GET", `users/${userId}`);
    }

    public async modifyCurrentUser(body?: { username?: string, avatar?: /** Image Data */ string }): Promise<UserStructure> {
        return this.makeAPIRequest("PATCH", "users/@me", body);
    }

    public async getCurrentUserGuilds(params: {
        before: string,
        after: string,
        limit: string,
        withCounts: boolean
    }): Promise<Array<Partial<GuildStructure>>> {
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

    public async getCurrentUserGuildMember(guildId: string): Promise<GuildMemberStructure> {
        return this.makeAPIRequest("GET", `users/@me/guilds/${guildId}/member`);
    }

    public async leaveGuild(guildId: string): Promise<null> {
        return this.makeAPIRequest("DELETE", `users/@me/guilds/${guildId}`);
    }

    public async createDM(userId: string): Promise<DMChannelStructure> {
        return this.makeAPIRequest("POST", "users/@me/channels", { recipient_id: userId });
    }

    public async createGroupDM(tokens: Array<string>, nicks: Record<string, string>): Promise<DMChannelStructure> {
        return this.makeAPIRequest("POST", "users/@me/channels", { access_tokens: tokens, nicks });
    }

    //#endregion User
}
