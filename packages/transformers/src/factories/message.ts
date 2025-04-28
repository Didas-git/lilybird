import { MentionChannel, channelFactory } from "./channel.js";
import { MessageFlags, MessageReferenceType } from "lilybird";
import { GuildMember } from "./guild-member.js";
import { Channel } from "./channel.js";
import { User } from "./user.js";

import type {
    Channel as LilyChannel,
    Message as LilyMessage,
    ResolvedDataStructure,
    LilybirdAttachment,
    MessageType,
    Application,
    Sticker,
    Client,
    Embed,
    Role
} from "lilybird";
import { Poll } from "./poll.js";

export type PartialMessage<T extends Message = Message> = Partial<T> & {
    [K in keyof Message as Message[K] extends (...args: Array<any>) => any ? K : K extends "id" | "channelId" | "client" ? K : never]: Message[K]
};

export interface MessageEditOptions extends LilyMessage.EditJSONParams {
    componentsV2?: boolean;
    suppressEmbeds?: boolean;
}

export interface MessageReplyOptions extends LilyMessage.CreateJSONParams {
    tts?: boolean;
    componentsV2?: boolean;
    suppressEmbeds?: boolean;
    suppressNotifications?: boolean;
}

export class Message {
    public readonly id: string;
    public readonly author!: User;
    public readonly channelId: string;
    public readonly content: string | undefined;
    public readonly timestamp!: Date;
    public readonly editedTimestamp: Date | undefined = undefined;
    public readonly tts: boolean;
    public readonly mentionsEveryone: boolean;
    public readonly mentions!: Array<User>;
    public readonly mentionedRoles: Array<Role.Structure>;
    public readonly mentionedChannels: Array<MentionChannel>;
    public readonly attachments: Array<LilyChannel.AttachmentStructure> | undefined;
    public readonly embeds: Array<Embed.Structure> | undefined;
    public readonly reactions: Array<LilyMessage.ReactionStructure>;
    public readonly nonce: string | number | undefined;
    public readonly pinned: boolean;
    public readonly webhookId: string | undefined;
    public readonly type: MessageType;
    public readonly activity: LilyMessage.ActivityStructure | undefined;
    public readonly application: Partial<Application.Structure> | undefined;
    public readonly applicationId: string | undefined;
    public readonly messageReference: LilyMessage.ReferenceStructure | undefined;
    public readonly flags: number;
    public readonly referencedMessage: Message | undefined;
    public readonly interactionMetadata: LilyMessage.InteractionMetadataStructure | undefined;
    public readonly interaction: LilyMessage.InteractionStructure | undefined;
    public readonly thread: Channel | undefined;
    public readonly components: Array<LilyMessage.Component.Structure> | undefined;
    public readonly stickerItems: Array<Sticker.ItemStructure> | undefined;
    public readonly stickers: Array<Sticker.Structure> | undefined;
    public readonly position: number | undefined;
    public readonly roleSubscriptionData: Role.SubscriptionDataStructure | undefined;
    public readonly resolved: ResolvedDataStructure | undefined;
    public readonly poll: Poll | undefined;
    public readonly guildId: string | undefined;
    public readonly member: GuildMember | undefined;

    public readonly client: Client;

    // Technically a `Partial` message
    public constructor(client: Client, message: LilyMessage.GuildStructure | LilyMessage.Structure) {
        this.client = client;

        this.id = message.id;
        this.channelId = message.channel_id;
        this.content = message.content;
        this.tts = message.tts;
        this.mentionsEveryone = message.mention_everyone;
        this.mentionedRoles = message.mention_roles;
        this.mentionedChannels = message.mention_channels?.map((channel) => new MentionChannel(client, channel)) ?? [];
        this.attachments = message.attachments;
        this.embeds = message.embeds;
        this.reactions = message.reactions;
        this.nonce = message.nonce;
        this.pinned = message.pinned;
        this.webhookId = message.webhook_id;
        this.type = message.type;
        this.activity = message.activity;
        this.application = message.application;
        this.applicationId = message.application_id;
        this.messageReference = message.message_reference;
        this.flags = message.flags ?? 0;
        this.interactionMetadata = message.interaction_metadata;
        this.interaction = message.interaction;
        this.components = message.components;
        this.stickerItems = message.sticker_items;
        this.stickers = message.stickers;
        this.position = message.position;
        this.roleSubscriptionData = message.role_subscription_data;
        this.resolved = message.resolved;
        //@ts-expect-error We can safely ignore this because accessing excess properties returns undefined
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.guildId = message.guild_id;

        if (typeof message.author !== "undefined") this.author = new User(client, message.author);
        if (typeof message.timestamp !== "undefined") this.timestamp = new Date(message.timestamp);
        if (typeof message.mentions !== "undefined") this.mentions = message.mentions.map((mention) => new User(client, mention));
        if (typeof message.thread !== "undefined") this.thread = channelFactory(client, message.thread);
        if ("member" in message) this.member = new GuildMember(client, <never>message.member);
        if (typeof message.poll !== "undefined") this.poll = new Poll(client, message.channel_id, message.id, message.poll);

        if (message.referenced_message != null) this.referencedMessage = new Message(client, message.referenced_message);
        if (message.edited_timestamp != null) this.editedTimestamp = new Date(message.edited_timestamp);
    }

    public async reply(content: string, options?: MessageReplyOptions): Promise<Message>;
    public async reply(options: MessageReplyOptions): Promise<Message>;
    public async reply(content: string | MessageReplyOptions, options?: MessageReplyOptions): Promise<Message> {
        let flags = 0;
        let data: LilyMessage.CreateJSONParams;
        let files: Array<LilybirdAttachment> | undefined;

        if (typeof content === "string") {
            if (typeof options !== "undefined") {
                const { suppressEmbeds, suppressNotifications, componentsV2, flags: fl, files: f, ...obj } = options;

                if (componentsV2) flags |= MessageFlags.IS_COMPONENTS_V2;
                if (suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;
                if (suppressNotifications) flags |= MessageFlags.SUPPRESS_NOTIFICATIONS;
                flags |= fl ?? 0;

                files = f;
                data = {
                    ...obj,
                    content
                };
            } else data = { content };
        } else {
            const { suppressEmbeds, suppressNotifications, componentsV2, flags: fl, files: f, ...obj } = content;
            flags |= fl ?? 0;

            if (componentsV2) flags |= MessageFlags.IS_COMPONENTS_V2;
            if (suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;
            if (suppressNotifications) flags |= MessageFlags.SUPPRESS_NOTIFICATIONS;

            files = f;
            data = obj;
        }

        return new Message(
            this.client,
            await this.client.rest.createMessage(this.channelId, {
                ...data,
                flags,
                message_reference: {
                    message_id: this.id
                }
            }, files)
        );
    }

    public async sendInChannel(content: string, options?: MessageReplyOptions): Promise<Message>;
    public async sendInChannel(options: MessageReplyOptions): Promise<Message>;
    public async sendInChannel(content: string | MessageReplyOptions, options?: MessageReplyOptions): Promise<Message> {
        let flags = 0;
        let data: LilyMessage.CreateJSONParams;
        let files: Array<LilybirdAttachment> | undefined;

        if (typeof content === "string") {
            if (typeof options !== "undefined") {
                const { suppressEmbeds, suppressNotifications, componentsV2, flags: fl, files: f, ...obj } = options;
                flags |= fl ?? 0;

                if (componentsV2) flags |= MessageFlags.IS_COMPONENTS_V2;
                if (suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;
                if (suppressNotifications) flags |= MessageFlags.SUPPRESS_NOTIFICATIONS;

                files = f;
                data = {
                    ...obj,
                    content
                };
            } else data = { content };
        } else {
            const { suppressEmbeds, suppressNotifications, componentsV2, flags: fl, files: f, ...obj } = content;
            flags |= fl ?? 0;

            if (componentsV2) flags |= MessageFlags.IS_COMPONENTS_V2;
            if (suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;
            if (suppressNotifications) flags |= MessageFlags.SUPPRESS_NOTIFICATIONS;

            files = f;
            data = obj;
        }

        return new Message(
            this.client,
            await this.client.rest.createMessage(this.channelId, {
                ...data,
                flags
            }, files)
        );
    }

    public async forwardTo(channelId: string, options: MessageReplyOptions): Promise<Message>;
    public async forwardTo(channelId: string, content: string | MessageReplyOptions, options?: MessageReplyOptions): Promise<Message> {
        let flags = 0;
        let data: LilyMessage.CreateJSONParams;
        let files: Array<LilybirdAttachment> | undefined;

        if (typeof content === "string") {
            if (typeof options !== "undefined") {
                const { suppressEmbeds, suppressNotifications, componentsV2, flags: fl, files: f, ...obj } = options;
                flags |= fl ?? 0;

                if (componentsV2) flags |= MessageFlags.IS_COMPONENTS_V2;
                if (suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;
                if (suppressNotifications) flags |= MessageFlags.SUPPRESS_NOTIFICATIONS;

                files = f;
                data = {
                    ...obj,
                    content
                };
            } else data = { content };
        } else {
            const { suppressEmbeds, suppressNotifications, componentsV2, flags: fl, files: f, ...obj } = content;
            flags |= fl ?? 0;

            if (componentsV2) flags |= MessageFlags.IS_COMPONENTS_V2;
            if (suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;
            if (suppressNotifications) flags |= MessageFlags.SUPPRESS_NOTIFICATIONS;

            files = f;
            data = obj;
        }

        return new Message(
            this.client,
            await this.client.rest.createMessage(this.channelId, {
                ...data,
                flags,
                message_reference: {
                    type: MessageReferenceType.FORWARD,
                    channel_id: channelId
                }
            }, files)
        );
    }

    public async edit(content: string, options?: MessageEditOptions): Promise<Message>;
    public async edit(options: MessageEditOptions): Promise<Message>;
    public async edit(content: string | MessageEditOptions, options?: MessageEditOptions): Promise<Message> {
        let flags = 0;
        let data: LilyMessage.EditJSONParams;
        let files: Array<LilybirdAttachment> | undefined;

        if (typeof content === "string") {
            if (typeof options !== "undefined") {
                const { suppressEmbeds, componentsV2, flags: fl, files: f, ...obj } = options;
                flags |= fl ?? 0;

                if (componentsV2) flags |= MessageFlags.IS_COMPONENTS_V2;
                if (suppressEmbeds) flags = MessageFlags.SUPPRESS_EMBEDS;

                files = f;
                data = <never>{
                    ...obj,
                    content,
                    flags
                };
            } else
                data = { content, flags };
        } else {
            const { suppressEmbeds, componentsV2, flags: fl, files: f, ...obj } = content;
            flags |= fl ?? 0;

            if (componentsV2) flags |= MessageFlags.IS_COMPONENTS_V2;
            if (suppressEmbeds) flags = MessageFlags.SUPPRESS_EMBEDS;

            files = f;
            data = <never>{
                ...obj,
                flags
            };
        }

        return new Message(this.client, await this.client.rest.editMessage(this.channelId, this.id, data, files));
    }

    public async react(emoji: string, isCustomEmoji = false): Promise<void> {
        await this.client.rest.createReaction(this.channelId, this.id, emoji, isCustomEmoji);
    }

    public async delete(reason?: string): Promise<void> {
        await this.client.rest.deleteMessage(this.channelId, this.id, reason);
    }

    public async crosspost(): Promise<void> {
        await this.client.rest.crosspostMessage(this.channelId, this.id);
    }

    public async pin(): Promise<void> {
        await this.client.rest.pinMessage(this.channelId, this.id);
    }

    public async unpin(): Promise<void> {
        await this.client.rest.unpinMessage(this.channelId, this.id);
    }

    public async startThread(name: string): Promise<Channel>;
    public async startThread(options: string | LilyChannel.Create.ThreadFromMessageJSONParams): Promise<Channel> {
        if (typeof options === "string") options = { name: options };
        return channelFactory(this.client, await this.client.rest.startThreadFromMessage(this.channelId, this.id, options));
    }

    public async fetchChannel(force: boolean = false): Promise<Channel> {
        if (!force) {
            const cachedChannel: unknown = await this.client.cache.channels.get(this.channelId);
            if (typeof cachedChannel !== "undefined") {
                if (cachedChannel instanceof Channel) return cachedChannel;
                return new Channel(this.client, <LilyChannel.Structure>cachedChannel, false);
            }
        }

        const channel = channelFactory(this.client, await this.client.rest.getChannel(this.channelId));
        await this.client.cache.channels.set(channel.id, channel);

        return channel;
    }

    public hasContent(): this is this & { content: string } {
        return typeof this.content !== "undefined";
    }

    public hasAttachments(): this is this & { attachments: Array<LilyChannel.AttachmentStructure> } {
        return typeof this.attachments !== "undefined" && this.attachments.length > 0;
    }

    public hasEmbeds(): this is this & { embeds: Array<Embed.Structure> } {
        return typeof this.embeds !== "undefined" && this.embeds.length > 0;
    }

    public hasComponents(): this is this & { components: Array<LilyMessage.Component.Structure> } {
        return typeof this.components !== "undefined" && this.components.length > 0;
    }

    public hasStickers(): this is this & { stickerItems: Array<Sticker.ItemStructure> } {
        return typeof this.stickerItems !== "undefined" && this.stickerItems.length > 0;
    }
}
