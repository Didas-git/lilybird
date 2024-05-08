import type { Webhook, Message, LilybirdAttachment, REST } from "lilybird";

export function parseDiscordWebhookURL(url: string): {
    branch: "ptb" | "canary" | "stable",
    version: number | "default",
    id: string,
    token: string
} {
    const isHttps = url[4] === "s";
    const domainStart = isHttps ? 8 : 7;

    const subDomainOrDomainIndex = url.indexOf(".", domainStart);
    const subDomainOrDomain = url.slice(domainStart, subDomainOrDomainIndex);
    const branch: "ptb" | "canary" | "stable" = subDomainOrDomain === "discord" ? "stable" : <"ptb" | "canary">subDomainOrDomain;

    const skipApi = subDomainOrDomainIndex + (subDomainOrDomain === "discord" ? 9 : 17);
    const afterApi = url.indexOf("/", skipApi);
    const version = url[skipApi] === "v" ? parseInt(url.slice(skipApi + 1, afterApi)) : "default";

    const afterSlash = afterApi + (typeof version === "number" ? 10 : 1);
    const finalSlash = url.indexOf("/", afterSlash);
    const id = url.slice(afterSlash, finalSlash);

    return { branch, version, id, token: url.slice(finalSlash + 1) };
}

export interface WebhookEditOptions extends Webhook.EditWebhookJSONParams {
    files?: Array<LilybirdAttachment> | undefined;
}

export interface WebhookExecuteOptions extends Webhook.ExecuteWebhookJSONParams {
    files?: Array<LilybirdAttachment> | undefined;
}

export class DiscordWebhook {
    public readonly id: string;
    public readonly token: string;

    readonly #rest: REST;

    public constructor(rest: REST, url: string) {
        this.#rest = rest;
        const { id, token } = parseDiscordWebhookURL(url);
        this.id = id;
        this.token = token;
    }

    /**
     * Deletes the webhook using token
     * @param reason
     */
    public async delete(reason?: string): Promise<void> {
        await this.#rest.deleteWebhookWithToken(this.id, this.token, reason);
    }

    /**
     * Edit a message that was sent by this webhook
     * @param messageId
     * @param options
     */
    public async editMessage(messageId: string, options: WebhookEditOptions): Promise<Message.Structure | null> {
        const { files, ...obj } = options;
        return this.#rest.editWebhookMessage(this.id, this.token, messageId, {}, obj, files);
    }

    /**
     * Edit a message that was sent by this webhook in a thread
     * @param threadId
     * @param messageId
     * @param options
     */
    public async editMessageInThread(threadId: string, messageId: string, options: WebhookEditOptions): Promise<Message.Structure | null> {
        const { files, ...obj } = options;
        return this.#rest.editWebhookMessage(this.id, this.token, messageId, { thread_id: threadId }, obj, files);
    }

    /**
     * Send a message using the webhook
     * @param options
     */
    public async send(options: WebhookExecuteOptions): Promise<Message.Structure> {
        const { files, ...obj } = options;
        const message = await this.#rest.executeWebhook(this.id, this.token, {
            wait: true
        }, obj, files);

        // This is not supposed to be hit since we have `wait` set to true but its safer than an assertion
        if (message === null) throw new Error("Did not receive a message back");
        return message;
    }

    /**
     * Send a message using the webhook
     * @param threadId
     * @param options
     */
    public async sendInThread(threadId: string, options: WebhookExecuteOptions): Promise<Message.Structure> {
        const { files, ...obj } = options;
        const message = await this.#rest.executeWebhook(this.id, this.token, {
            wait: true,
            thread_id: threadId
        }, obj, files);

        // This is not supposed to be hit since we have `wait` set to true but its safer than an assertion
        if (message === null) throw new Error("Did not receive a message back");
        return message;
    }

    /**
     * Delete message that was sent by this webhook
     * @param messageId
     * @param threadId
     */
    public async deleteMessage(messageId: string, threadId?: string): Promise<void> {
        await this.#rest.deleteWebhookMessage(this.id, this.token, messageId, {
            thread_id: threadId
        });
    }

    /**
     * Gets a message that was sent by this webhook.
     * @param messageId
     * @param threadId
     */
    public async getMessage(messageId: string, threadId?: string): Promise<Message.Structure> {
        return this.#rest.getWebhookMessage(this.id, this.token, messageId, { thread_id: threadId });
    }

    /**
     * Returns the URL of the webhook
     */
    public get url(): string {
        return `https://discord.com/api/webhooks/${this.id}/${this.token}`;
    }
}
