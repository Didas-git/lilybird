import { MentionChannel, channelFactory } from "./channel.js";
import { GuildMember } from "./guild-member.js";
import { MessageFlags } from "lilybird";
import { User } from "./user.js";

import type { ReplyOptions } from "../typings/shared.js";
import type { Channel } from "./channel.js";

import type {
    CreateThreadFromMessageStructure,
    RoleSubscriptionDataStructure,
    MessageInteractionStructure,
    MessageComponentStructure,
    MessageReferenceStructure,
    MessageActivityStructure,
    CreateMessageStructure,
    ResolvedDataStructure,
    GuildMessageStructure,
    ApplicationStructure,
    StickerItemStructure,
    EditMessageStructure,
    AttachmentStructure,
    LilybirdAttachment,
    ReactionStructure,
    StickerStructure,
    EmbedStructure,
    RoleStructure,
    MessageType,
    Client
} from "lilybird";

// eslint-disable-next-line @typescript-eslint/ban-types
export type PartialMessage<T extends Message = Message> = Partial<T> & { [K in keyof Message as Message[K] extends Function ? K : K extends "id" | "channelId" ? K : never]: Message[K] };

export interface MessageEditOptions extends ReplyOptions {
    suppressEmbeds?: boolean;
}

export interface MessageReplyOptions extends ReplyOptions {
    tts?: boolean;
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
    public readonly mentionedRoles: Array<RoleStructure>;
    public readonly mentionedChannels: Array<MentionChannel>;
    public readonly attachments: Array<AttachmentStructure> | undefined;
    public readonly embeds: Array<EmbedStructure> | undefined;
    public readonly reactions: Array<ReactionStructure>;
    public readonly nonce: string | number | undefined;
    public readonly pinned: boolean;
    public readonly webhookId: string | undefined;
    public readonly type: MessageType;
    public readonly activity: MessageActivityStructure | undefined;
    public readonly application: Partial<ApplicationStructure> | undefined;
    public readonly applicationId: string | undefined;
    public readonly messageReference: MessageReferenceStructure | undefined;
    public readonly flags: number;
    public readonly referencedMessage: Message | undefined;
    public readonly interaction: MessageInteractionStructure | undefined;
    public readonly thread: Channel | undefined;
    public readonly components: Array<MessageComponentStructure> | undefined;
    public readonly stickerItems: Array<StickerItemStructure> | undefined;
    public readonly stickers: Array<StickerStructure> | undefined;
    public readonly position: number | undefined;
    public readonly roleSubscriptionData: RoleSubscriptionDataStructure | undefined;
    public readonly resolved: ResolvedDataStructure | undefined;
    public readonly guildId: string | undefined;
    public readonly member: GuildMember | undefined;

    public readonly client: Client;

    // Technically a `Partial` message
    public constructor(client: Client, message: GuildMessageStructure) {
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
        this.interaction = message.interaction;
        this.components = message.components;
        this.stickerItems = message.sticker_items;
        this.stickers = message.stickers;
        this.position = message.position;
        this.roleSubscriptionData = message.role_subscription_data;
        this.resolved = message.resolved;
        this.guildId = message.guild_id;

        if (typeof message.author !== "undefined") this.author = new User(client, message.author);
        if (typeof message.timestamp !== "undefined") this.timestamp = new Date(message.timestamp);
        if (typeof message.mentions !== "undefined") this.mentions = message.mentions.map((mention) => new User(client, mention));
        if (typeof message.member !== "undefined") this.member = new GuildMember(client, <never>message.member);
        if (typeof message.thread !== "undefined") this.thread = channelFactory(client, message.thread);

        if (message.referenced_message != null) this.referencedMessage = new Message(client, message.referenced_message);
        if (message.edited_timestamp != null) this.editedTimestamp = new Date(message.edited_timestamp);
    }

    public async reply(content: string, options?: MessageReplyOptions): Promise<Message>;
    public async reply(options: MessageReplyOptions): Promise<Message>;
    public async reply(content: string | MessageReplyOptions, options?: MessageReplyOptions): Promise<Message> {
        let flags = 0;
        let data: CreateMessageStructure;
        let files: Array<LilybirdAttachment> | undefined;

        if (typeof content === "string") {
            if (typeof options !== "undefined") {
                const { suppressEmbeds, suppressNotifications, files: f, ...obj } = options;

                if (suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;
                if (suppressNotifications) flags |= MessageFlags.SUPPRESS_NOTIFICATIONS;

                files = f;
                data = {
                    ...obj,
                    content
                };
            } else data = { content };
        } else {
            const { suppressEmbeds, suppressNotifications, files: f, ...obj } = content;

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

    public async edit(content: string, options?: MessageEditOptions): Promise<Message>;
    public async edit(options: MessageEditOptions): Promise<Message>;
    public async edit(content: string | MessageEditOptions, options?: MessageEditOptions): Promise<Message> {
        let flags = 0;
        let data: EditMessageStructure;
        let files: Array<LilybirdAttachment> | undefined;

        if (typeof content === "string") {
            if (typeof options !== "undefined") {
                const { suppressEmbeds, files: f, ...obj } = options;

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
            const { suppressEmbeds, files: f, ...obj } = content;

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
    public async startThread(options: string | CreateThreadFromMessageStructure): Promise<Channel> {
        if (typeof options === "string") options = { name: options };
        return channelFactory(this.client, await this.client.rest.startThreadFromMessage(this.channelId, this.id, options));
    }

    public async fetchChannel(force: boolean = false): Promise<Channel> {
        if (!force) {
            const cachedChannel = await this.client.cache.channels.get(this.channelId) as Channel;
            if (typeof cachedChannel !== "undefined") return cachedChannel;
        }

        const channel = channelFactory(this.client, await this.client.rest.getChannel(this.channelId));
        await this.client.cache.channels.set(channel.id, channel);

        return channel;
    }

    public hasContent(): this is this & { content: string } {
        return typeof this.content !== "undefined";
    }

    public hasAttachments(): this is this & { attachments: Array<AttachmentStructure> } {
        return typeof this.attachments !== "undefined" && this.attachments.length > 0;
    }

    public hasEmbeds(): this is this & { embeds: Array<EmbedStructure> } {
        return typeof this.embeds !== "undefined" && this.embeds.length > 0;
    }

    public hasComponents(): this is this & { components: Array<MessageComponentStructure> } {
        return typeof this.components !== "undefined" && this.components.length > 0;
    }

    public hasStickers(): this is this & { stickers: Array<StickerStructure> } {
        return typeof this.stickers !== "undefined" && this.stickers.length > 0;
    }
}
