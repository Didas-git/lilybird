// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
import { version } from "../../package.json";
import type { MFALevel, OnboardingMode } from "../enums";

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
    ExecuteWebhookStructure,
    CreateMessageStructure,
    ThreadChannelStructure,
    WelcomeScreenStructure,
    CreateThreadStructure,
    ThreadMemberStructure,
    GuildPreviewStructure,
    EditWebhookStructure,
    EditMessageStructure,
    GuildMemberStructure,
    CreateGuildStructure,
    ModifyGuildStructure,
    VoiceRegionStructure,
    IntegrationStructure,
    GuildWidgetStructure,
    AttachmentStructure,
    DMChannelStructure,
    MessageStructure,
    ChannelStructure,
    APIRoleStructure,
    InviteStructure,
    GuildStructure,
    UserStructure,
    RoleStructure,
    ErrorMessage,
    BanStructure,
    LilybirdAttachment
} from "../typings";

export class REST {
    public static baseUrl = "https://discord.com/api/v10/";
    public static cdnUrl = "https://cdn.discordapp.com/";

    #token?: string | undefined;

    public constructor(token?: string) {
        if (typeof token === "undefined")
            return;

        this.#token = token;
    }

    async #makeRequest<T>(method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT", path: string, data?: Record<string, any>, cdn = false): Promise<T> {
        const opts: RequestInit = {
            method,
            headers: {
                Authorization: `Bot ${this.#token}`,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "User-Agent": `DiscordBot/LilyBird/${version}`
            }
        };

        if (typeof data !== "undefined") {
            const { files, reason, ...obj } = <{ reason: string, files: Array<LilybirdAttachment>, attachments: Array<unknown> | undefined }>data;

            if (typeof files !== "undefined" && files.length > 0) {
                const temp: Array<Partial<AttachmentStructure>> = [];
                const form = new FormData();

                for (let i = 0, { length } = files; i < length; i++) {
                    form.append(`files[${i}]`, files[i].file, files[i].name);
                    temp.push({
                        id: i,
                        filename: files[i].name
                    });
                }

                obj.attachments = [...temp, ...obj.attachments ?? []];
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

        const response = await fetch(`${cdn ? REST.cdnUrl : REST.baseUrl}${path}`, opts);

        if (!response.ok) {
            const errorMessage: ErrorMessage = await response.json();
            throw new Error(errorMessage.message);
        }

        /*
            This assertion is a bit dangerous to make
            but since this is internal we should be fine
        */
        if (response.status === 204) return <T>null;

        return <T> await response.json();
    }

    public async getGateway(): Promise<{ url: string }> {
        return this.#makeRequest("GET", "gateway");
    }

    public async getGlobalApplicationCommands(clientId: string): Promise<Array<LocalizedGlobalApplicationCommandStructure>>;
    public async getGlobalApplicationCommands(clientId: string, withLocalizations: true): Promise<Array<LocalizationGlobalApplicationCommandStructure>>;
    public async getGlobalApplicationCommands(clientId: string, withLocalizations = false): Promise<Array<LocalizationGlobalApplicationCommandStructure | LocalizedGlobalApplicationCommandStructure>> {
        return this.#makeRequest("GET", `applications/${clientId}/commands?with_localizations=${withLocalizations}`);
    }

    public async createGlobalApplicationCommands(clientId: string, body: POSTApplicationCommandStructure): Promise<LocalizationGlobalApplicationCommandStructure> {
        return this.#makeRequest("POST", `applications/${clientId}/commands`, body);
    }

    public async getGlobalApplicationCommand(clientId: string, commandId: string): Promise<LocalizationGlobalApplicationCommandStructure> {
        return this.#makeRequest("GET", `applications/${clientId}/commands/${commandId}`);
    }

    public async editGlobalApplicationCommand(clientId: string, commandId: string, body: Partial<POSTApplicationCommandStructure>): Promise<LocalizationGlobalApplicationCommandStructure> {
        return this.#makeRequest("PATCH", `applications/${clientId}/commands/${commandId}`, body);
    }

    public async deleteGlobalApplicationCommand(clientId: string, commandId: string): Promise<null> {
        return this.#makeRequest("DELETE", `applications/${clientId}/commands/${commandId}`);
    }

    public async bulkOverwriteGlobalApplicationCommand(clientId: string, body: Array<POSTApplicationCommandStructure>): Promise<Array<LocalizationGlobalApplicationCommandStructure>> {
        return this.#makeRequest("PUT", `applications/${clientId}/commands`, body);
    }

    public async getGuildApplicationCommands(clientId: string): Promise<Array<LocalizedGuildApplicationCommandStructure>>;
    public async getGuildApplicationCommands(clientId: string, withLocalizations: true): Promise<Array<LocalizationGuildApplicationCommandStructure>>;
    public async getGuildApplicationCommands(clientId: string, withLocalizations = false): Promise<Array<LocalizationGuildApplicationCommandStructure | LocalizedGuildApplicationCommandStructure>> {
        return this.#makeRequest("GET", `applications/${clientId}/commands?with_localizations=${withLocalizations}`);
    }

    public async createGuildApplicationCommand(clientId: string, guildId: string, body: POSTApplicationCommandStructure): Promise<LocalizationGuildApplicationCommandStructure> {
        return this.#makeRequest("POST", `applications/${clientId}/guilds/${guildId}/commands`, body);
    }

    public async getGuildApplicationCommand(clientId: string, guildId: string, commandId: string): Promise<LocalizationGuildApplicationCommandStructure> {
        return this.#makeRequest("POST", `applications/${clientId}/guilds/${guildId}/commands/${commandId}`);
    }

    public async editGuildApplicationCommand(clientId: string, guildId: string, commandId: string, body: Partial<POSTApplicationCommandStructure>): Promise<LocalizationGuildApplicationCommandStructure> {
        return this.#makeRequest("PATCH", `applications/${clientId}/guilds/${guildId}/commands/${commandId}`, body);
    }

    public async deleteGuildApplicationCommand(clientId: string, guildId: string, commandId: string): Promise<null> {
        return this.#makeRequest("DELETE", `applications/${clientId}/guilds/${guildId}/commands/${commandId}`);
    }

    public async bulkOverwriteGuildApplicationCommand(clientId: string, guildId: string, body: Array<POSTApplicationCommandStructure>): Promise<Array<LocalizationGuildApplicationCommandStructure>> {
        return this.#makeRequest("PATCH", `applications/${clientId}/guilds/${guildId}/commands`, body);
    }

    public async getGuildApplicationCommandPermissions(clientId: string, guildId: string): Promise<Array<GuildApplicationCommandPermissionsStructure>> {
        return this.#makeRequest("GET", `applications/${clientId}/guilds/${guildId}/commands/permissions`);
    }

    public async getApplicationCommandPermissions(clientId: string, guildId: string, commandId: string): Promise<GuildApplicationCommandPermissionsStructure> {
        return this.#makeRequest("GET", `applications/${clientId}/guilds/${guildId}/commands/${commandId}/permissions`);
    }

    public async editApplicationCommandPermissions(
        clientId: string,
        guildId: string,
        commandId: string,
        body: { permissions: Array<ApplicationCommandPermissionsStructure> }
    ): Promise<GuildApplicationCommandPermissionsStructure> {
        return this.#makeRequest("PATCH", `applications/${clientId}/guilds/${guildId}/commands/${commandId}/permissions`, body);
    }

    public async createInteractionResponse(interactionId: string, interactionToken: string, body: InteractionResponseStructure): Promise<null> {
        return this.#makeRequest("POST", `interactions/${interactionId}/${interactionToken}/callback`, body);
    }

    public async getOriginalInteractionResponse(clientId: string, interactionToken: string): Promise<InteractionResponseStructure> {
        return this.#makeRequest("GET", `webhooks/${clientId}/${interactionToken}/messages/@original`);
    }

    public async editOriginalInteractionResponse(clientId: string, interactionToken: string, body: EditWebhookStructure): Promise<InteractionResponseStructure> {
        return this.#makeRequest("PATCH", `webhooks/${clientId}/${interactionToken}/messages/@original`, body);
    }

    public async deleteOriginalInteractionResponse(clientId: string, interactionToken: string): Promise<null> {
        return this.#makeRequest("DELETE", `webhooks/${clientId}/${interactionToken}/messages/@original`);
    }

    public async createFollowupMessage(clientId: string, interactionToken: string, body: ExecuteWebhookStructure): Promise<MessageStructure> {
        return this.#makeRequest("POST", `webhooks/${clientId}/${interactionToken}`, body);
    }

    public async getFollowupMessage(clientId: string, interactionToken: string, messageId: string): Promise<InteractionResponseStructure> {
        return this.#makeRequest("GET", `webhooks/${clientId}/${interactionToken}/messages/${messageId}`);
    }

    public async editFollowupMessage(clientId: string, interactionToken: string, messageId: string, body: EditWebhookStructure): Promise<InteractionResponseStructure> {
        return this.#makeRequest("PATCH", `webhooks/${clientId}/${interactionToken}/messages/${messageId}`, body);
    }

    public async deleteFollowupMessage(clientId: string, interactionToken: string, messageId: string): Promise<null> {
        return this.#makeRequest("DELETE", `webhooks/${clientId}/${interactionToken}/messages/${messageId}`);
    }

    public async getChannel(channelId: string): Promise<ChannelStructure> {
        return this.#makeRequest("GET", `channels/${channelId}`);
    }

    public async modifyChannel(channelId: string, body: ModifyGuildChannelStructure | ModifyDMChannelStructure | ModifyThreadChannelStructure): Promise<ChannelStructure> {
        return this.#makeRequest("PATCH", `channels/${channelId}`, body);
    }

    public async deleteChannel(channelId: string, reason?: string): Promise<ChannelStructure> {
        return this.#makeRequest("DELETE", `channels/${channelId}`, { reason });
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

        return this.#makeRequest("GET", url);
    }

    public async getChannelMessage(channelId: string, messageId: string): Promise<MessageStructure> {
        return this.#makeRequest("GET", `channels/${channelId}/messages/${messageId}`);
    }

    public async createMessage(channelId: string, body: CreateMessageStructure): Promise<MessageStructure> {
        return this.#makeRequest("POST", `channels/${channelId}/messages`, body);
    }

    public async crosspostMessage(channelId: string, messageId: string): Promise<MessageStructure> {
        return this.#makeRequest("POST", `channels/${channelId}/messages/${messageId}/crosspost`);
    }

    public async createReaction(channelId: string, messageId: string, emoji: string, isCustom = false): Promise<null> {
        if (!isCustom) {
            // biome-ignore lint/style/noParameterAssign: There is no reason to create an entire new variable in this case
            emoji = encodeURIComponent(emoji);
        }
        return this.#makeRequest("PUT", `channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`);
    }

    public async deleteOwnReaction(channelId: string, messageId: string, emoji: string, isCustom = false): Promise<null> {
        if (!isCustom) {
            // biome-ignore lint/style/noParameterAssign: There is no reason to create an entire new variable in this case
            emoji = encodeURIComponent(emoji);
        }
        return this.#makeRequest("DELETE", `channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`);
    }

    public async deleteUserReaction(channelId: string, messageId: string, userId: string, emoji: string, isCustom = false): Promise<null> {
        if (!isCustom) {
            // biome-ignore lint/style/noParameterAssign: There is no reason to create an entire new variable in this case
            emoji = encodeURIComponent(emoji);
        }
        return this.#makeRequest("DELETE", `channels/${channelId}/messages/${messageId}/reactions/${emoji}/${userId}`);
    }

    public async getReactions(channelId: string, messageId: string, emoji: string, isCustom = false, params: { after?: number, limit?: string } = {}): Promise<Array<UserStructure>> {
        if (!isCustom) {
            // biome-ignore lint/style/noParameterAssign: There is no reason to create an entire new variable in this case
            emoji = encodeURIComponent(emoji);
        }

        let url = `channels/${channelId}/messages/${messageId}/reactions/${emoji}?`;
        if (typeof params.after !== "undefined")
            url += `after=${params.after}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.#makeRequest("GET", url);
    }

    public async deleteAllReactions(channelId: string, messageId: string): Promise<null> {
        return this.#makeRequest("DELETE", `channels/${channelId}/messages/${messageId}/reactions`);
    }

    public async deleteAllReactionsForEmoji(channelId: string, messageId: string, emoji: string, isCustom = false): Promise<null> {
        if (!isCustom) {
            // biome-ignore lint/style/noParameterAssign: There is no reason to create an entire new variable in this case
            emoji = encodeURIComponent(emoji);
        }
        return this.#makeRequest("DELETE", `channels/${channelId}/messages/${messageId}/reactions/${emoji}`);
    }

    public async editMessage(channelId: string, messageId: string, params: EditMessageStructure): Promise<MessageStructure> {
        return this.#makeRequest("PATCH", `channels/${channelId}/messages/${messageId}`, params);
    }

    public async deleteMessage(channelId: string, messageId: string, reason?: string): Promise<null> {
        return this.#makeRequest("DELETE", `channels/${channelId}/messages/${messageId}`, { reason });
    }

    public async bulkDeleteMessages(channelId: string, messageIds: Array<string>, reason?: string): Promise<null> {
        return this.#makeRequest("POST", `channels/${channelId}/messages/bulk-delete`, { messages: messageIds, reason });
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
        return this.#makeRequest("PUT", `channels/${channelId}/permissions/${overwriteId}`, params);
    }

    public async getChannelInvites(channelId: string): Promise<Array<InviteStructure>> {
        return this.#makeRequest("GET", `channels/${channelId}/invites`);
    }

    public async createChannelInvite(channelId: string, body: CreateChannelInviteStructure): Promise<InviteStructure> {
        return this.#makeRequest("POST", `channels/${channelId}/invites`, body);
    }

    public async deleteChannelPermission(channelId: string, overwriteId: string, reason?: string): Promise<null> {
        return this.#makeRequest("DELETE", `channels/${channelId}/permissions/${overwriteId}`, { reason });
    }

    public async followAnnouncementChannel(channelId: string, body: { webhook_channel_id?: string }): Promise<FollowedChannelStructure> {
        return this.#makeRequest("DELETE", `channels/${channelId}/followers`, body);
    }

    public async triggerTypingIndicator(channelId: string): Promise<null> {
        return this.#makeRequest("POST", `channels/${channelId}/typing`);
    }

    public async getPinnedMessages(channelId: string): Promise<null> {
        return this.#makeRequest("GET", `channels/${channelId}/pins`);
    }

    public async pinMessage(channelId: string, messageId: string, reason?: string): Promise<null> {
        return this.#makeRequest("PUT", `channels/${channelId}/pins/${messageId}`, { reason });
    }

    public async unpinMessage(channelId: string, messageId: string, reason?: string): Promise<null> {
        return this.#makeRequest("DELETE", `channels/${channelId}/pins/${messageId}`, { reason });
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public async groupDMAddRecipient(channelId: string, userId: string, body: { access_token: string, nick: string }): Promise<null> {
        return this.#makeRequest("PUT", `channels/${channelId}/recipients/${userId}`, body);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public async groupDMRemoveRecipient(channelId: string, userId: string): Promise<null> {
        return this.#makeRequest("DELETE", `channels/${channelId}/recipients/${userId}`);
    }

    public async startThreadFromMessage(channelId: string, messageId: string, body: CreateThreadFromMessageStructure): Promise<ChannelStructure> {
        return this.#makeRequest("POST", `channels/${channelId}/messages/${messageId}/threads`, body);
    }

    public async startThreadWithoutMessage(channelId: string, body: CreateThreadStructure): Promise<ChannelStructure> {
        return this.#makeRequest("POST", `channels/${channelId}/threads`, body);
    }

    public async startThreadInForumOrMediaChannel(channelId: string, body: CreateForumMediaThreadStructure): Promise<ChannelStructure> {
        return this.#makeRequest("POST", `channels/${channelId}/threads`, body);
    }

    public async joinThread(channelId: string): Promise<null> {
        return this.#makeRequest("PUT", `channels/${channelId}/thread-members/@me`);
    }

    public async addThreadMember(channelId: string, userId: string): Promise<null> {
        return this.#makeRequest("PUT", `channels/${channelId}/thread-members/${userId}`);
    }

    public async leaveThread(channelId: string): Promise<null> {
        return this.#makeRequest("DELETE", `channels/${channelId}/thread-members/@me`);
    }

    public async removeThreadMember(channelId: string, userId: string): Promise<null> {
        return this.#makeRequest("DELETE", `channels/${channelId}/thread-members/${userId}`);
    }

    public async getThreadMember(channelId: string, userId: string, withMember = false): Promise<ThreadMemberStructure> {
        return this.#makeRequest("GET", `channels/${channelId}/thread-members/${userId}?with_member=${withMember}`);
    }

    public async listThreadMembers(channelId: string, params: { after?: number, limit?: string } = {}): Promise<Array<ThreadMemberStructure>> {
        let url = `channels/${channelId}/thread-members`;
        if (typeof params.after !== "undefined")
            url += `after=${params.after}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.#makeRequest("GET", url);
    }

    public async listPublicArchivedThreads(channelId: string, params: { before?: /* ISO8601 Timestamp */ string, limit?: string } = {}): Promise<ListArchivedThreadsReturnStructure> {
        let url = `channels/${channelId}/threads/archived/public`;
        if (typeof params.before !== "undefined")
            url += `before=${params.before}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.#makeRequest("GET", url);
    }

    public async listPrivateArchivedThreads(channelId: string, params: { before?: /* ISO8601 Timestamp */ string, limit?: string } = {}): Promise<ListArchivedThreadsReturnStructure> {
        let url = `channels/${channelId}/threads/archived/private`;
        if (typeof params.before !== "undefined")
            url += `before=${params.before}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.#makeRequest("GET", url);
    }

    public async listJoinedPrivateArchivedThreads(channelId: string, params: { before?: /* ISO8601 Timestamp */ string, limit?: string } = {}): Promise<ListArchivedThreadsReturnStructure> {
        let url = `channels/${channelId}/users/@me/threads/archived/private`;
        if (typeof params.before !== "undefined")
            url += `before=${params.before}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.#makeRequest("GET", url);
    }

    public async getCurrentUser(): Promise<UserStructure> {
        return this.#makeRequest("GET", "users/@me");
    }

    public async getUser(userId: string): Promise<UserStructure> {
        return this.#makeRequest("GET", `users/${userId}`);
    }

    public async modifyCurrentUser(body?: { username?: string, avatar?: /** Image Data */ string }): Promise<UserStructure> {
        return this.#makeRequest("PATCH", "users/@me", body);
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

        return this.#makeRequest("GET", url);
    }

    public async getCurrentUserGuildMember(guildId: string): Promise<GuildMemberStructure> {
        return this.#makeRequest("GET", `users/@me/guilds/${guildId}/member`);
    }

    public async leaveGuild(guildId: string): Promise<null> {
        return this.#makeRequest("DELETE", `users/@me/guilds/${guildId}`);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public async createDM(userId: string): Promise<DMChannelStructure> {
        return this.#makeRequest("POST", "users/@me/channels", { recipient_id: userId });
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public async createGroupDM(tokens: Array<string>, nicks: Record<string, string>): Promise<DMChannelStructure> {
        return this.#makeRequest("POST", "users/@me/channels", { access_tokens: tokens, nicks });
    }

    public async createGuild(body: CreateGuildStructure): Promise<GuildStructure> {
        return this.#makeRequest("POST", "guilds", body);
    }

    public async getGuild(guildId: string, withCounts = false): Promise<GuildStructure> {
        return this.#makeRequest("GET", `guilds/${guildId}?with_counts=${withCounts}`);
    }

    public async getGuildPreview(guildId: string): Promise<GuildPreviewStructure> {
        return this.#makeRequest("GET", `guilds/${guildId}/preview`);
    }

    public async modifyGuild(guildId: string, body: ModifyGuildStructure): Promise<GuildStructure> {
        return this.#makeRequest("PATCH", `guilds/${guildId}`, body);
    }

    public async deleteGuild(guildId: string): Promise<null> {
        return this.#makeRequest("DELETE", `guilds/${guildId}`);
    }

    public async getGuildChannels(guildId: string): Promise<Array<ChannelStructure>> {
        return this.#makeRequest("GET", `guilds/${guildId}/channels`);
    }

    public async createGuildChannel(guildId: string, body: CreateGuildChannelStructure): Promise<ChannelStructure> {
        return this.#makeRequest("POST", `guilds/${guildId}/channels`, body);
    }

    public async modifyGuildChannelPositions(guildId: string, body: Array<ModifyChannelPositionStructure>): Promise<ChannelStructure> {
        return this.#makeRequest("PATCH", `guilds/${guildId}/channels`, body);
    }

    public async listActiveGuildThreads(guildId: string): Promise<{
        threads: Array<ThreadChannelStructure>,
        members: Array<ThreadMemberStructure>
    }> {
        return this.#makeRequest("GET", `guilds/${guildId}/threads/active`);
    }

    public async getGuildMember(guildId: string, userId: string): Promise<GuildMemberStructure> {
        return this.#makeRequest("GET", `guilds/${guildId}/members/${userId}`);
    }

    public async listGuildMembers(guildId: string, params: { limit: number, after: string }): Promise<Array<GuildMemberStructure>> {
        let url = `guilds/${guildId}/members`;
        if (typeof params.after !== "undefined")
            url += `after=${params.after}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.#makeRequest("GET", url);
    }

    public async searchGuildMembers(guildId: string, params: { query: string, limit: number }): Promise<Array<GuildMemberStructure>> {
        let url = `guilds/${guildId}/members/search`;
        if (typeof params.query !== "undefined")
            url += `query=${params.query}&`;

        if (typeof params.limit !== "undefined")
            url += `limit=${params.limit}`;

        return this.#makeRequest("GET", url);
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
    ): Promise<GuildMemberStructure> {
        return this.#makeRequest("PUT", `guilds/${guildId}/members/${userId}`, body);
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
        return this.#makeRequest("PATCH", `guilds/${guildId}/members/${userId}`, body);
    }

    public async modifyCurrentMember(
        guildId: string,
        body: {
            reason?: string | null,
            nick?: string | null
        }
    ): Promise<GuildMemberStructure> {
        return this.#makeRequest("PATCH", `guilds/${guildId}/members/@me`, body);
    }

    public async addGuildMemberRole(guildId: string, userId: string, roleId: string, reason: string): Promise<null> {
        return this.#makeRequest("PUT", `guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
    }

    public async removeGuildMemberRole(guildId: string, userId: string, roleId: string, reason: string): Promise<null> {
        return this.#makeRequest("DELETE", `guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
    }

    public async removeGuildMember(guildId: string, userId: string, reason: string): Promise<null> {
        return this.#makeRequest("DELETE", `guilds/${guildId}/members/${userId}`, { reason });
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

        return this.#makeRequest("GET", url);
    }

    public async getGuildBan(guildId: string, userId: string): Promise<BanStructure> {
        return this.#makeRequest("GET", `guilds/${guildId}/bans/${userId}`);
    }

    public async createGuildBan(
        guildId: string,
        userId: string,
        body: {
            reason?: string,
            delete_message_seconds?: number
        }
    ): Promise<null> {
        return this.#makeRequest("PUT", `guilds/${guildId}/bans/${userId}`, body);
    }

    public async removeGuildBan(guildId: string, userId: string, reason?: string): Promise<null> {
        return this.#makeRequest("PUT", `guilds/${guildId}/bans/${userId}`, { reason });
    }

    public async getGuildRoles(guildId: string): Promise<Array<RoleStructure>> {
        return this.#makeRequest("GET", `guilds/${guildId}/roles`);
    }

    public async createGuildRole(guildId: string, body: APIRoleStructure): Promise<RoleStructure> {
        return this.#makeRequest("POST", `guilds/${guildId}/roles`, body);
    }

    public async modifyGuildRolePosition(guildId: string, body: { reason?: string, id: string, position?: number | null }): Promise<Array<RoleStructure>> {
        return this.#makeRequest("PATCH", `guilds/${guildId}/roles`, body);
    }

    public async modifyGuildRole(guildId: string, roleId: string, body: Partial<APIRoleStructure>): Promise<RoleStructure> {
        return this.#makeRequest("PATCH", `guilds/${guildId}/roles/${roleId}`, body);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public async modifyGuildMFALevel(guildId: string, level: MFALevel): Promise<MFALevel> {
        return this.#makeRequest("POST", `guilds/${guildId}/mfa`, { level });
    }

    public async deleteGuildRole(guildId: string, roleId: string, reason?: string): Promise<null> {
        return this.#makeRequest("DELETE", `guilds/${guildId}/roles/${roleId}`, { reason });
    }

    public async getGuildPruneCount(guildId: string, params: { days: number, include_roles?: string }): Promise<{ pruned: number }> {
        let url = `guilds/${guildId}/prune`;
        if (typeof params.days !== "undefined")
            url += `days=${params.days}&`;

        if (typeof params.include_roles !== "undefined")
            url += `include_roles=${params.include_roles}`;

        return this.#makeRequest("GET", url);
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
        return this.#makeRequest("POST", `guilds/${guildId}/prune`, body);
    }

    public async getGuildVoiceRegions(guildId: string): Promise<Array<VoiceRegionStructure>> {
        return this.#makeRequest("GET", `guilds/${guildId}/regions`);
    }

    public async getGuildInvites(guildId: string): Promise<Array<InviteStructure>> {
        return this.#makeRequest("GET", `guilds/${guildId}/invites`);
    }

    public async getGuildIntegrations(guildId: string): Promise<Array<IntegrationStructure>> {
        return this.#makeRequest("GET", `guilds/${guildId}/integrations`);
    }

    public async deleteGuildIntegration(guildId: string, integrationId: string, reason?: string): Promise<null> {
        return this.#makeRequest("DELETE", `guilds/${guildId}/integrations/${integrationId}`, { reason });
    }

    public async getGuildWidgetSettings(guildId: string): Promise<GuildWidgetSettingsStructure> {
        return this.#makeRequest("GET", `guilds/${guildId}/widget`);
    }

    public async modifyGuildWidget(guildId: string, body: GuildWidgetSettingsStructure & { reason?: string }): Promise<GuildWidgetSettingsStructure> {
        return this.#makeRequest("PATCH", `guilds/${guildId}/widget`, body);
    }

    public async getGuildWidget(guildId: string): Promise<GuildWidgetStructure> {
        return this.#makeRequest("GET", `guilds/${guildId}/widget.json`);
    }

    public async getGuildVanityUrl(guildId: string): Promise<Partial<InviteStructure>> {
        return this.#makeRequest("GET", `guilds/${guildId}/vanity-url`);
    }

    /** Yeah... this probably doesn't work */
    public async getGuildWidgetImage(guildId: string, style = "shield"): Promise<string> {
        return this.#makeRequest("GET", `guilds/${guildId}/widget.png?style=${style}`);
    }

    public async getGuildWelcomeScreen(guildId: string): Promise<WelcomeScreenStructure> {
        return this.#makeRequest("GET", `guilds/${guildId}/welcome-screen`);
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
        return this.#makeRequest("PATCH", `guilds/${guildId}/welcome-screen`, body);
    }

    public async getGuildOnboarding(guildId: string): Promise<GuildOnboardingStructure> {
        return this.#makeRequest("GET", `guilds/${guildId}/onboarding`);
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
        return this.#makeRequest("PUT", `guilds/${guildId}/onboarding`, body);
    }

    public async modifyCurrentUserVoiceState(
        guildId: string,
        body: {
            channel_id?: string,
            suppress?: boolean,
            request_to_speak_timestamp?: string | null
        }
    ): Promise<null> {
        return this.#makeRequest("PATCH", `guilds/${guildId}/voice-states/@me`, body);
    }

    public async modifyUserVoiceState(
        guildId: string,
        userId: string,
        body: {
            channel_id: string,
            suppress?: boolean
        }
    ): Promise<null> {
        return this.#makeRequest("PATCH", `guilds/${guildId}/voice-states/${userId}`, body);
    }

    public setToken(token: string | undefined): void {
        this.#token = token;
    }
}
