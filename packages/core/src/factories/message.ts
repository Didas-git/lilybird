import { MessageFlags, type MessageType } from "../enums";
import { MentionChannel, channelFactory, type Channel } from "./channel";
import { GuildMember } from "./guild";
import { User } from "./user";

import type { Client } from "../client";

import type { MessageComponentStructure, CreateMessageStructure, GuildMessageStructure, EditMessageStructure, AttachmentStructure, ReactionStructure, StickerStructure, EmbedStructure, RoleStructure, ReplyOptions } from "../typings";

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
    public readonly author: User;
    public readonly channelId: string;
    public readonly content: string | undefined;
    public readonly timestamp: Date;
    public readonly editedTimestamp: Date | null = null;
    public readonly tts: boolean;
    public readonly mentionsEveryone: boolean;
    public readonly mentions: Array<User>;
    public readonly mentionedRoles: Array<RoleStructure>;
    public readonly mentionedChannel: Array<MentionChannel>;
    public readonly attachments: Array<AttachmentStructure> | undefined;
    public readonly embeds: Array<EmbedStructure> | undefined;
    public readonly reactions: Array<ReactionStructure>;
    public readonly nonce: string | number | undefined;
    public readonly pinned: boolean;
    public readonly webhookId: string | undefined;
    public readonly type: MessageType;

    public readonly components: Array<MessageComponentStructure> | undefined;

    public readonly stickers: Array<StickerStructure> | undefined;

    public readonly guildId: string | undefined;
    public readonly member: GuildMember | undefined;

    public readonly client: Client;

    public constructor(client: Client, message: GuildMessageStructure) {
        this.client = client;

        this.id = message.id;
        this.author = new User(client, message.author);
        this.channelId = message.channel_id;
        this.content = message.content;
        this.timestamp = new Date(message.timestamp);
        this.tts = message.tts;
        this.mentionsEveryone = message.mention_everyone;
        this.mentions = message.mentions.map((mention) => new User(client, mention));
        this.mentionedRoles = message.mention_roles;
        this.mentionedChannel = message.mention_channels?.map((channel) => new MentionChannel(client, channel)) ?? [];
        this.attachments = message.attachments;
        this.embeds = message.embeds;
        this.reactions = message.reactions;
        this.nonce = message.nonce;
        this.pinned = message.pinned;
        this.webhookId = message.webhook_id;
        this.type = message.type;

        this.components = message.components;

        this.stickers = message.stickers;

        this.guildId = message.guild_id;

        if (message.edited_timestamp != null) {
            this.editedTimestamp = new Date(message.edited_timestamp);
        }

        if (typeof message.member !== "undefined") {
            this.member = new GuildMember(client, <never>message.member);
        }
    }

    public async reply(content: string, options?: MessageReplyOptions): Promise<Message>;
    public async reply(options: MessageReplyOptions): Promise<Message>;
    public async reply(content: string | MessageReplyOptions, options?: MessageReplyOptions): Promise<Message> {
        let flags = 0;
        let data: CreateMessageStructure;

        if (typeof content === "string") {
            if (typeof options !== "undefined") {
                const { suppressEmbeds, suppressNotifications, ...obj } = options;

                if (suppressEmbeds) {
                    flags |= MessageFlags.SUPPRESS_EMBEDS;
                }
                if (suppressNotifications) {
                    flags |= MessageFlags.SUPPRESS_NOTIFICATIONS;
                }

                data = {
                    ...obj,
                    content,
                };
            } else {
                data = { content };
            }
        } else {
            const { suppressEmbeds, suppressNotifications, ...obj } = content;

            if (suppressEmbeds) {
                flags |= MessageFlags.SUPPRESS_EMBEDS;
            }
            if (suppressNotifications) {
                flags |= MessageFlags.SUPPRESS_NOTIFICATIONS;
            }

            data = obj;
        }

        return new Message(
            this.client,
            await this.client.rest.createMessage(this.channelId, {
                ...data,
                flags,
                message_reference: {
                    message_id: this.id,
                },
            }),
        );
    }

    public async edit(content: string, options?: MessageEditOptions): Promise<Message>;
    public async edit(options: MessageEditOptions): Promise<Message>;
    public async edit(content: string | MessageEditOptions, options?: MessageEditOptions): Promise<Message> {
        let flags = 0;
        let data: EditMessageStructure;

        if (typeof content === "string") {
            if (typeof options !== "undefined") {
                const { suppressEmbeds, ...obj } = options;

                if (suppressEmbeds) {
                    flags = MessageFlags.SUPPRESS_EMBEDS;
                }

                data = <never>{
                    ...obj,
                    content,
                    flags,
                };
            } else {
                data = { content, flags };
            }
        } else {
            const { suppressEmbeds, ...obj } = content;
            if (suppressEmbeds) {
                flags = MessageFlags.SUPPRESS_EMBEDS;
            }

            data = <never>{
                ...obj,
                flags,
            };
        }

        return new Message(this.client, await this.client.rest.editMessage(this.channelId, this.id, data));
    }

    public async react(emoji: string, isCustomEmoji = false): Promise<void> {
        await this.client.rest.createReaction(this.channelId, this.id, emoji, isCustomEmoji);
    }

    public async delete(reason?: string): Promise<void> {
        await this.client.rest.deleteMessage(this.channelId, this.id, reason);
    }

    public async fetchChannel(): Promise<Channel> {
        return channelFactory(this.client, await this.client.rest.getChannel(this.channelId));
    }

    public hasContent(): this is this & { content: string } {
        return typeof this.content !== "undefined";
    }

    public hasAttachments(): this is this & { attachments: Array<AttachmentStructure> } {
        return typeof this.attachments !== "undefined";
    }

    public hasEmbeds(): this is this & { embeds: Array<EmbedStructure> } {
        return typeof this.embeds !== "undefined";
    }

    public hasComponents(): this is this & { components: Array<MessageComponentStructure> } {
        return typeof this.components !== "undefined";
    }

    public hasStickers(): this is this & { stickers: Array<StickerStructure> } {
        return typeof this.stickers !== "undefined";
    }
}
