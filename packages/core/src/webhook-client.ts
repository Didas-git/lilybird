import type {
    EditWebhookStructure,
    ExecuteWebhookStructure,
    LilybirdAttachment,
    MessageStructure,
    WebhookStructure
} from "./typings/index.js";
import { WebhookType } from "#enums";
import { REST } from "./http/rest.js";
import { userAvatarURL } from "./http/cdn.js";

export type WebhookClientOptions = ({
    id: string,
    token: string
} | {
    url: string
}) & Omit<Partial<WebhookStructure>, "id" | "token" | "url">;

export class WebhookClient {
    public token: string;
    public id: string;
    public readonly rest: REST = new REST();
    public options: WebhookClientOptions;

    public constructor(options: WebhookClientOptions) {
        if ("url" in options) {
            const { id, token } = this.parseUrl(options.url);
            this.token = token;
            this.id = id;
        } else {
            this.token = options.token;
            this.id = options.id;
        }

        this.options = options;
    }

    /**
     * Parse a webhook URL into its ID and token
     * @param url
     * @private
     */
    private parseUrl(url: string): { id: string, token: string } {
        const matches = (/https?:\/\/(?:ptb\.|canary\.)?discord\.com\/api(?:\/v\d{1,2})?\/webhooks\/(\d{17,19})\/([\w-]{68})/i).exec(url);

        if (!matches || matches.length <= 2) throw new Error("Invalid webhook URL");

        const [, id, token] = matches;

        return { id, token };
    }

    /**
     * Deletes the webhook using token
     * @param reason
     */
    public async delete(reason?: string): Promise<void> {
        await this.rest.deleteWebhookWithToken(this.token, reason ?? "");
    }

    /**
     * Edit a message that was sent by this webhook
     * @param messageId
     * @param options
     * @param files
     */
    public async editMessage(messageId: string, options: EditWebhookStructure, files?: Array<LilybirdAttachment> | undefined): Promise<MessageStructure | null> {
        return this.rest.editWebhookMessage(this.id, this.token, messageId, {
            thread_id: options.thread_id
        }, options, files);
    }

    /**
     * Send a message using the webhook
     * @param options
     * @param files
     */
    public async send(options: ExecuteWebhookStructure, files?: Array<LilybirdAttachment> | undefined): Promise<MessageStructure | null> {
        return this.rest.executeWebhook(this.id, this.token, {
            wait: true,
            thread_id: options.thread_id
        }, options, files);
    }

    /**
     * Delete message that was sent by this webhook
     * @param messageId
     * @param threadId
     */
    public async deleteMessage(messageId: string, threadId?: string): Promise<void> {
        await this.rest.deleteWebhookMessage(this.id, this.token, messageId, {
            thread_id: threadId
        });
    }

    /**
     * Gets a message that was sent by this webhook.
     * @param messageId
     * @param threadId
     */
    public async message(messageId: string, threadId?: string): Promise<MessageStructure> {
        return this.rest.getWebhookMessage(this.id, this.token, messageId, { thread_id: threadId });
    }

    /**
     * Check if the webhook is an incoming webhook
     */
    public isIncoming(): boolean {
        return this.options.type === WebhookType.Incoming;
    }

    /**
     * Check if the webhook is a channel follower webhook
     */
    public isChannelFollower(): boolean {
        return this.options.type === WebhookType.ChannelFollower;
    }

    /**
     * Check if the webhook is an application webhook
     */
    public isApplication(): boolean {
        return this.options.type === WebhookType.Application;
    }

    /**
     * Returns the URL of the webhook
     */
    public get url(): string {
        return `https://discord.com/api/webhooks/${this.id}/${this.token}`;
    }

    /**
     * Returns the avatar URL of the webhook
     */
    public get avatarURL(): string | null {
        return this.options.avatar ? userAvatarURL(this.id, this.options.avatar ?? "") : null;
    }
}
