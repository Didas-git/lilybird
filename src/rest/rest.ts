// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { version }: { version: number } = require("../../package.json");

import type {
    LocalizationGlobalApplicationCommandStructure,
    LocalizationGuildApplicationCommandStructure,
    GuildApplicationCommandPermissionsStructure,
    LocalizedGlobalApplicationCommandStructure,
    LocalizedGuildApplicationCommandStructure,
    ApplicationCommandPermissionsStructure,
    POSTApplicationCommandStructure,
    InteractionResponseStructure,
    ModifyThreadChannelStructure,
    ModifyGuildChannelStructure,
    GetChannelMessagesStructure,
    ModifyDMChannelStructure,
    ExecuteWebhookStructure,
    EditWebhookStructure,
    CreateMessageStructure,
    EditMessageStructure,
    MessageStructure,
    ChannelStructure,
    InviteStructure,
    ErrorMessage,
    UserStructure,
    CreateChannelInviteStructure,
    FollowedChannelStructure,
    CreateThreadFromMessageStructure,
    CreateThreadStructure,
    CreateForumMediaThreadStructure,
    ThreadMemberStructure,
    ListArchivedThreadsReturnStructure,
    AttachmentStructure
} from "../typings";

export class REST {
    public static baseUrl = "https://discord.com/api/v10/";
    public static cdnUrl = "https://cdn.discordapp.com/";

    #token?: string | undefined;

    public constructor(token?: string) {
        if (typeof token === "undefined") return;
        this.#token = token;
    }

    async #makeRequest<T>(
        method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT",
        path: string,
        data?: Record<string, any>,
        cdn: boolean = false
    ): Promise<T> {
        const opts: RequestInit = {
            method,
            headers: {
                "Authorization": `Bot ${this.#token}`,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "User-Agent": `DiscordBot/LilyBird/${version}`
            }
        };

        if (typeof data !== "undefined") {
            const { files, ...obj } = data;

            if (typeof files !== "undefined" && files.length > 0) {
                const temp: Array<Partial<AttachmentStructure>> = [];
                const form = new FormData();

                for (let i = 0, length = files.length; i < length; i++) {
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

        return <T>await response.json();
    }

    public async getGlobalApplicationCommands(clientId: string): Promise<Array<LocalizedGlobalApplicationCommandStructure>>;
    public async getGlobalApplicationCommands(clientId: string, withLocalizations: true): Promise<Array<LocalizationGlobalApplicationCommandStructure>>;
    public async getGlobalApplicationCommands(clientId: string, withLocalizations: boolean = false): Promise<Array<LocalizationGlobalApplicationCommandStructure | LocalizedGlobalApplicationCommandStructure>> {
        return await this.#makeRequest("GET", `applications/${clientId}/commands?with_localizations=${withLocalizations}`);
    }

    public async createGlobalApplicationCommands(clientId: string, body: POSTApplicationCommandStructure): Promise<LocalizationGlobalApplicationCommandStructure> {
        return await this.#makeRequest("POST", `applications/${clientId}/commands`, body);
    }

    public async getGlobalApplicationCommand(clientId: string, commandId: string): Promise<LocalizationGlobalApplicationCommandStructure> {
        return await this.#makeRequest("GET", `applications/${clientId}/commands/${commandId}`);
    }

    public async editGlobalApplicationCommand(clientId: string, commandId: string, body: Partial<POSTApplicationCommandStructure>): Promise<LocalizationGlobalApplicationCommandStructure> {
        return await this.#makeRequest("PATCH", `applications/${clientId}/commands/${commandId}`, body);
    }

    public async deleteGlobalApplicationCommand(clientId: string, commandId: string): Promise<null> {
        return await this.#makeRequest("DELETE", `applications/${clientId}/commands/${commandId}`);
    }

    public async bulkOverwriteGlobalApplicationCommand(clientId: string, body: Array<POSTApplicationCommandStructure>): Promise<Array<LocalizationGlobalApplicationCommandStructure>> {
        return await this.#makeRequest("PUT", `applications/${clientId}/commands`, body);
    }

    public async getGuildApplicationCommands(clientId: string): Promise<Array<LocalizedGuildApplicationCommandStructure>>;
    public async getGuildApplicationCommands(clientId: string, withLocalizations: true): Promise<Array<LocalizationGuildApplicationCommandStructure>>;
    public async getGuildApplicationCommands(clientId: string, withLocalizations: boolean = false): Promise<Array<LocalizationGuildApplicationCommandStructure | LocalizedGuildApplicationCommandStructure>> {
        return await this.#makeRequest("GET", `applications/${clientId}/commands?with_localizations=${withLocalizations}`);
    }

    public async createGuildApplicationCommand(clientId: string, guildId: string, body: POSTApplicationCommandStructure): Promise<LocalizationGuildApplicationCommandStructure> {
        return await this.#makeRequest("POST", `applications/${clientId}/guilds/${guildId}/commands`, body);
    }

    public async getGuildApplicationCommand(clientId: string, guildId: string, commandId: string): Promise<LocalizationGuildApplicationCommandStructure> {
        return await this.#makeRequest("POST", `applications/${clientId}/guilds/${guildId}/commands/${commandId}`);
    }

    public async editGuildApplicationCommand(clientId: string, guildId: string, commandId: string, body: Partial<POSTApplicationCommandStructure>): Promise<LocalizationGuildApplicationCommandStructure> {
        return await this.#makeRequest("PATCH", `applications/${clientId}/guilds/${guildId}/commands/${commandId}`, body);
    }

    public async deleteGuildApplicationCommand(clientId: string, guildId: string, commandId: string): Promise<null> {
        return await this.#makeRequest("DELETE", `applications/${clientId}/guilds/${guildId}/commands/${commandId}`);
    }

    public async bulkOverwriteGuildApplicationCommand(clientId: string, guildId: string, body: Array<POSTApplicationCommandStructure>): Promise<Array<LocalizationGuildApplicationCommandStructure>> {
        return await this.#makeRequest("PATCH", `applications/${clientId}/guilds/${guildId}/commands`, body);
    }

    public async getGuildApplicationCommandPermissions(clientId: string, guildId: string): Promise<Array<GuildApplicationCommandPermissionsStructure>> {
        return await this.#makeRequest("GET", `applications/${clientId}/guilds/${guildId}/commands/permissions`);
    }

    public async getApplicationCommandPermissions(clientId: string, guildId: string, commandId: string): Promise<GuildApplicationCommandPermissionsStructure> {
        return await this.#makeRequest("GET", `applications/${clientId}/guilds/${guildId}/commands/${commandId}/permissions`);
    }

    public async editApplicationCommandPermissions(
        clientId: string,
        guildId: string,
        commandId: string,
        body: { permissions: Array<ApplicationCommandPermissionsStructure> }
    ): Promise<GuildApplicationCommandPermissionsStructure> {
        return await this.#makeRequest("PATCH", `applications/${clientId}/guilds/${guildId}/commands/${commandId}/permissions`, body);
    }

    public async createInteractionResponse(interactionId: string, interactionToken: string, body: InteractionResponseStructure): Promise<null> {
        return await this.#makeRequest("POST", `interactions/${interactionId}/${interactionToken}/callback`, body);
    }

    public async getOriginalInteractionResponse(clientId: string, interactionToken: string): Promise<InteractionResponseStructure> {
        return await this.#makeRequest("GET", `webhooks/${clientId}/${interactionToken}/messages/@original`);
    }

    public async editOriginalInteractionResponse(clientId: string, interactionToken: string, body: EditWebhookStructure): Promise<InteractionResponseStructure> {
        return await this.#makeRequest("PATCH", `webhooks/${clientId}/${interactionToken}/messages/@original`, body);
    }

    public async deleteOriginalInteractionResponse(clientId: string, interactionToken: string): Promise<null> {
        return await this.#makeRequest("DELETE", `webhooks/${clientId}/${interactionToken}/messages/@original`);
    }

    public async createFollowupMessage(clientId: string, interactionToken: string, body: ExecuteWebhookStructure): Promise<null> {
        return await this.#makeRequest("POST", `webhooks/${clientId}/${interactionToken}`, body);
    }

    public async getFollowupMessage(clientId: string, interactionToken: string, messageId: string): Promise<InteractionResponseStructure> {
        return await this.#makeRequest("GET", `webhooks/${clientId}/${interactionToken}/messages/${messageId}`);
    }

    public async editFollowupMessage(clientId: string, interactionToken: string, messageId: string, body: EditWebhookStructure): Promise<InteractionResponseStructure> {
        return await this.#makeRequest("PATCH", `webhooks/${clientId}/${interactionToken}/messages/${messageId}`, body);
    }

    public async deleteFollowupMessage(clientId: string, interactionToken: string, messageId: string): Promise<null> {
        return await this.#makeRequest("DELETE", `webhooks/${clientId}/${interactionToken}/messages/${messageId}`);
    }

    public async getChannel(channelId: string): Promise<ChannelStructure> {
        return await this.#makeRequest("GET", `channels/${channelId}`);
    }

    public async modifyChannel(channelId: string, body: ModifyGuildChannelStructure | ModifyDMChannelStructure | ModifyThreadChannelStructure): Promise<ChannelStructure> {
        return await this.#makeRequest("PATCH", `channels/${channelId}`, body);
    }

    public async deleteChannel(channelId: string): Promise<ChannelStructure> {
        return await this.#makeRequest("DELETE", `channels/${channelId}`);
    }

    public async getChannelMessages(channelId: string, params: GetChannelMessagesStructure): Promise<Array<MessageStructure>> {
        let url = `channels/${channelId}/messages?`;
        if (typeof params.around !== "undefined") url += `around=${params.around}&`;
        if (typeof params.before !== "undefined") url += `before=${params.before}&`;
        if (typeof params.after !== "undefined") url += `after=${params.after}&`;
        if (typeof params.limit !== "undefined") url += `limit=${params.limit}`;
        return await this.#makeRequest("GET", url);
    }

    public async getChannelMessage(channelId: string, messageId: string): Promise<MessageStructure> {
        return await this.#makeRequest("GET", `channels/${channelId}/messages/${messageId}`);
    }

    public async createMessage(channelId: string, body: CreateMessageStructure): Promise<MessageStructure> {
        return await this.#makeRequest("POST", `channels/${channelId}/messages`, body);
    }

    public async crosspostMessage(channelId: string, messageId: string): Promise<MessageStructure> {
        return await this.#makeRequest("POST", `channels/${channelId}/messages/${messageId}/crosspost`);
    }

    public async createReaction(channelId: string, messageId: string, emoji: string, isCustom: boolean = false): Promise<null> {
        if (!isCustom) emoji = encodeURIComponent(emoji);
        return await this.#makeRequest("PUT", `channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`);
    }

    public async deleteOwnReaction(channelId: string, messageId: string, emoji: string, isCustom: boolean = false): Promise<null> {
        if (!isCustom) emoji = encodeURIComponent(emoji);
        return await this.#makeRequest("DELETE", `channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`);
    }

    public async deleteUserReaction(channelId: string, messageId: string, userId: string, emoji: string, isCustom: boolean = false): Promise<null> {
        if (!isCustom) emoji = encodeURIComponent(emoji);
        return await this.#makeRequest("DELETE", `channels/${channelId}/messages/${messageId}/reactions/${emoji}/${userId}`);
    }

    public async getReactions(channelId: string, messageId: string, emoji: string, isCustom: boolean = false, params: { after?: number, limit?: string } = {}): Promise<Array<UserStructure>> {
        if (!isCustom) emoji = encodeURIComponent(emoji);

        let url = `channels/${channelId}/messages/${messageId}/reactions/${emoji}?`;
        if (typeof params.after !== "undefined") url += `after=${params.after}&`;
        if (typeof params.limit !== "undefined") url += `limit=${params.limit}`;

        return await this.#makeRequest("GET", url);
    }

    public async deleteAllReactions(channelId: string, messageId: string): Promise<null> {
        return await this.#makeRequest("DELETE", `channels/${channelId}/messages/${messageId}/reactions`);
    }

    public async deleteAllReactionsForEmoji(channelId: string, messageId: string, emoji: string, isCustom: boolean = false): Promise<null> {
        if (!isCustom) emoji = encodeURIComponent(emoji);
        return await this.#makeRequest("DELETE", `channels/${channelId}/messages/${messageId}/reactions/${emoji}`);
    }

    public async editMessage(channelId: string, messageId: string, params: EditMessageStructure): Promise<MessageStructure> {
        return await this.#makeRequest("PATCH", `channels/${channelId}/messages/${messageId}`, params);
    }

    public async deleteMessage(channelId: string, messageId: string): Promise<null> {
        return await this.#makeRequest("DELETE", `channels/${channelId}/messages/${messageId}`);
    }

    public async bulkDeleteMessages(channelId: string, messageIds: Array<string>): Promise<null> {
        return await this.#makeRequest("POST", `channels/${channelId}/messages/bulk-delete`, messageIds);
    }

    public async editChannelPermissions(
        channelId: string,
        overwriteId: string,
        params: {
            allow?: string | null,
            deny?: string | null,
            /** 0 for a role or 1 for a member */
            type: 0 | 1
        }
    ): Promise<null> {
        return await this.#makeRequest("PUT", `channels/${channelId}/permissions/${overwriteId}`, params);
    }

    public async getChannelInvites(channelId: string): Promise<Array<InviteStructure>> {
        return await this.#makeRequest("GET", `channels/${channelId}/invites`);
    }

    public async createChannelInvite(channelId: string, body: CreateChannelInviteStructure): Promise<InviteStructure> {
        return await this.#makeRequest("POST", `channels/${channelId}/invites`, body);
    }

    public async deleteChannelPermission(channelId: string, overwriteId: string): Promise<null> {
        return await this.#makeRequest("DELETE", `channels/${channelId}/permissions/${overwriteId}`);
    }

    public async followAnnouncementChannel(channelId: string, body: { webhook_channel_id?: string }): Promise<FollowedChannelStructure> {
        return await this.#makeRequest("DELETE", `channels/${channelId}/followers`, body);
    }

    public async triggerTypingIndicator(channelId: string): Promise<null> {
        return await this.#makeRequest("POST", `channels/${channelId}/typing`);
    }

    public async getPinnedMessages(channelId: string): Promise<null> {
        return await this.#makeRequest("GET", `channels/${channelId}/pins`);
    }

    public async pinMessage(channelId: string, messageId: string): Promise<null> {
        return await this.#makeRequest("PUT", `channels/${channelId}/pins/${messageId}`);
    }

    public async unpinMessage(channelId: string, messageId: string): Promise<null> {
        return await this.#makeRequest("DELETE", `channels/${channelId}/pins/${messageId}`);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public async groupDMAddRecipient(channelId: string, userId: string, body: { access_token: string, nick: string }): Promise<null> {
        return await this.#makeRequest("PUT", `channels/${channelId}/recipients/${userId}`, body);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public async groupDMRemoveRecipient(channelId: string, userId: string): Promise<null> {
        return await this.#makeRequest("DELETE", `channels/${channelId}/recipients/${userId}`);
    }

    public async startThreadFromMessage(channelId: string, messageId: string, body: CreateThreadFromMessageStructure): Promise<ChannelStructure> {
        return await this.#makeRequest("POST", `channels/${channelId}/messages/${messageId}/threads`, body);
    }

    public async startThreadWithoutMessage(channelId: string, body: CreateThreadStructure): Promise<ChannelStructure> {
        return await this.#makeRequest("POST", `channels/${channelId}/threads`, body);
    }

    public async startThreadInForumOrMediaChannel(channelId: string, body: CreateForumMediaThreadStructure): Promise<ChannelStructure> {
        return await this.#makeRequest("POST", `channels/${channelId}/threads`, body);
    }

    public async joinThread(channelId: string): Promise<null> {
        return await this.#makeRequest("PUT", `channels/${channelId}/thread-members/@me`);
    }

    public async addThreadMember(channelId: string, userId: string): Promise<null> {
        return await this.#makeRequest("PUT", `channels/${channelId}/thread-members/${userId}`);
    }

    public async leaveThread(channelId: string): Promise<null> {
        return await this.#makeRequest("DELETE", `channels/${channelId}/thread-members/@me`);
    }

    public async removeThreadMember(channelId: string, userId: string): Promise<null> {
        return await this.#makeRequest("DELETE", `channels/${channelId}/thread-members/${userId}`);
    }

    public async getThreadMember(channelId: string, userId: string, withMember: boolean = false): Promise<ThreadMemberStructure> {
        return await this.#makeRequest("GET", `channels/${channelId}/thread-members/${userId}?with_member=${withMember}`);
    }

    public async listThreadMembers(channelId: string, params: { after?: number, limit?: string } = {}): Promise<Array<ThreadMemberStructure>> {
        let url = `channels/${channelId}/thread-members`;
        if (typeof params.after !== "undefined") url += `after=${params.after}&`;
        if (typeof params.limit !== "undefined") url += `limit=${params.limit}`;
        return await this.#makeRequest("GET", url);
    }

    public async listPublicArchivedThreads(channelId: string, params: { before?: /* ISO8601 Timestamp */ string, limit?: string } = {}): Promise<ListArchivedThreadsReturnStructure> {
        let url = `channels/${channelId}/threads/archived/public`;
        if (typeof params.before !== "undefined") url += `before=${params.before}&`;
        if (typeof params.limit !== "undefined") url += `limit=${params.limit}`;
        return await this.#makeRequest("GET", url);
    }

    public async listPrivateArchivedThreads(channelId: string, params: { before?: /* ISO8601 Timestamp */ string, limit?: string } = {}): Promise<ListArchivedThreadsReturnStructure> {
        let url = `channels/${channelId}/threads/archived/private`;
        if (typeof params.before !== "undefined") url += `before=${params.before}&`;
        if (typeof params.limit !== "undefined") url += `limit=${params.limit}`;
        return await this.#makeRequest("GET", url);
    }

    public async listJoinedPrivateArchivedThreads(channelId: string, params: { before?: /* ISO8601 Timestamp */ string, limit?: string } = {}): Promise<ListArchivedThreadsReturnStructure> {
        let url = `channels/${channelId}/users/@me/threads/archived/private`;
        if (typeof params.before !== "undefined") url += `before=${params.before}&`;
        if (typeof params.limit !== "undefined") url += `limit=${params.limit}`;
        return await this.#makeRequest("GET", url);
    }

    public setToken(token: string | undefined): void {
        this.#token = token;
    }
}
