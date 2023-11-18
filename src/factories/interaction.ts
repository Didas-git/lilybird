/* eslint-disable @typescript-eslint/naming-convention */
import { type PartialChannel, channelFactory } from "./channel";
import { GuildMember } from "./guild";
import { User } from "./user";

import {
    ApplicationCommandOptionType,
    InteractionCallbackType,
    InteractionType,
    MessageFlags
} from "../enums";

import type { Client } from "../client";
import type {
    ApplicationCommandType,
    ComponentType,
    Locale
} from "../enums";

import type {
    ApplicationCommandDataStructure,
    MessageComponentDataStructure,
    GuildInteractionStructure,
    MessageComponentStructure,
    ModalSubmitDataStructure,
    DMInteractionStructure,
    SelectOptionStructure,
    ResolvedDataStructure,
    EntitlementStructure,
    InteractionStructure,
    AttachmentStructure,
    MessageStructure,
    EmbedStructure,
    EmojiStructure,
    InteractionCallbackData
} from "../typings";

export function interactionFactory(client: Client, interaction: InteractionStructure): Interaction<InteractionData> {
    const data = interactionDataFactory(interaction);
    if ("guild_id" in interaction) return new GuildInteraction(client, interaction, true, data);
    return new DMInteraction(client, interaction, false, data);
}

function interactionDataFactory(interaction: InteractionStructure): InteractionData {
    switch (interaction.type) {
        case InteractionType.PING:
            return undefined;
        case InteractionType.APPLICATION_COMMAND:
        case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE: {
            return new ApplicationCommandData(interaction.data);
        }
        case InteractionType.MESSAGE_COMPONENT: {
            return new MessageComponentData(interaction.data);
        }
        case InteractionType.MODAL_SUBMIT: {
            return new ModalSubmitData(interaction.data);
        }
    }
}

export type InteractionData = ApplicationCommandData<undefined | string | number> | AutocompleteData | MessageComponentData | ModalSubmitData | undefined;

interface AutocompleteData extends Omit<ApplicationCommandDataStructure, "options"> {
    options: ApplicationCommandOptions<string | number>;
}

interface ReplyOptions {
    tts?: boolean;
    ephemeral?: boolean;
    suppressEmbeds?: boolean;
    embeds?: Array<EmbedStructure>;
    components?: Array<MessageComponentStructure>;
    attachments?: Array<Partial<AttachmentStructure>>;
}

interface ReplyOptionsWithContent extends ReplyOptions {
    content?: string;
}

interface EditReplyOptions extends Pick<ReplyOptions, "embeds" | "components" | "attachments"> { }

export class Interaction<T extends InteractionData, M extends undefined | MessageStructure = undefined> {
    public readonly client: Client;
    public readonly id: string;
    public readonly applicationId: string;
    public readonly type: InteractionType;
    public readonly token: string;
    public readonly version: 1 = 1;
    /** This is only undefined if type is PING */
    public readonly locale: Locale | undefined;
    public readonly entitlements: Array<EntitlementStructure>;
    public readonly data: T;
    public readonly message: M = <M>undefined;

    readonly #inGuild: boolean;

    protected constructor(
        client: Client,
        interaction: GuildInteractionStructure | DMInteractionStructure,
        isGuild: boolean,
        data?: T
    ) {
        this.#inGuild = isGuild;

        this.client = client;
        this.id = interaction.id;
        this.applicationId = interaction.application_id;
        this.type = interaction.type;
        this.token = interaction.token;
        this.locale = interaction.locale;
        this.entitlements = interaction.entitlements;

        this.data = <never>data;

        "message" in interaction && (this.message = <never>interaction.message);
    }

    public async reply(content: string, options?: ReplyOptions): Promise<void>;
    public async reply(options: ReplyOptions): Promise<void>;
    public async reply(content: string | ReplyOptionsWithContent, options?: ReplyOptions): Promise<void> {
        let flags = 0;
        let data: InteractionCallbackData;

        if (typeof content === "string") {
            if (options?.ephemeral) flags |= MessageFlags.EPHEMERAL;
            if (options?.suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;

            data = {
                ...options,
                content,
                flags
            };
        } else {
            if (content.ephemeral) flags |= MessageFlags.EPHEMERAL;
            if (content.suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;

            data = {
                ...content,
                flags
            };
        }

        await this.client.rest.createInteractionResponse(this.id, this.token, {
            type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
            data
        });
    }

    public async deferReply(ephemeral: boolean = false): Promise<void> {
        await this.client.rest.createInteractionResponse(this.id, this.token, {
            type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                flags: ephemeral ? MessageFlags.EPHEMERAL : 0
            }
        });
    }

    public async followUp(content: string, options?: ReplyOptions): Promise<void>;
    public async followUp(options: ReplyOptions): Promise<void>;
    public async followUp(content: string | ReplyOptionsWithContent, options?: ReplyOptions): Promise<void> {
        let flags = 0;

        let data: InteractionCallbackData;

        if (typeof content === "string") {
            if (options?.ephemeral) flags |= MessageFlags.EPHEMERAL;
            if (options?.suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;

            data = {
                ...options,
                content,
                flags
            };
        } else {
            if (content.ephemeral) flags |= MessageFlags.EPHEMERAL;
            if (content.suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;

            data = {
                ...content,
                flags
            };
        }

        await this.client.rest.createFollowupMessage(this.client.id, this.token, data);
    }

    public async editReply(content: string, options?: EditReplyOptions): Promise<void>;
    public async editReply(options: EditReplyOptions): Promise<void>;
    public async editReply(content: string | EditReplyOptions, options?: EditReplyOptions): Promise<void> {
        await this.client.rest.editOriginalInteractionResponse(this.client.id, this.token, typeof content === "string"
            ? {
                content,
                ...options
            }
            : content);
    }

    public isPingInteraction(): this is Interaction<undefined> {
        return this.type === InteractionType.PING;
    }

    public isApplicationCommandInteraction(): this is Interaction<ApplicationCommandData<undefined>> {
        return this.type === InteractionType.APPLICATION_COMMAND;
    }

    public isAutocompleteInteraction(): this is Interaction<AutocompleteData> {
        return this.type === InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE;
    }

    public isMessageComponentInteraction(): this is Interaction<MessageComponentData, MessageStructure> {
        return this.type === InteractionType.MESSAGE_COMPONENT;
    }

    public isModalSubmitInteraction(): this is Interaction<ModalSubmitData> {
        return this.type === InteractionType.MODAL_SUBMIT;
    }

    public inGuild(): this is GuildInteraction<T> {
        return this.#inGuild;
    }

    public inDM(): this is DMInteraction<T> {
        return !this.#inGuild;
    }
}

interface GuildInteraction<T extends InteractionData, M extends undefined | MessageStructure = undefined> extends Interaction<T, M> {
    isPingInteraction: () => this is GuildInteraction<undefined>;
    isApplicationCommandInteraction: () => this is GuildInteraction<ApplicationCommandData<undefined>>;
    isAutocompleteInteraction: () => this is GuildInteraction<AutocompleteData>;
    isMessageComponentInteraction: () => this is GuildInteraction<MessageComponentData, MessageStructure>;
    isModalSubmitInteraction: () => this is GuildInteraction<ModalSubmitData>;
}

class GuildInteraction<T extends InteractionData, M extends undefined | MessageStructure = undefined> extends Interaction<T, M> {
    public readonly guildId: string;
    public readonly channel: PartialChannel;
    public readonly channelId: string;
    public readonly member: GuildMember;
    public readonly appPermissions: string;
    public readonly guildLocale: Locale;

    public constructor(
        client: Client,
        interaction: GuildInteractionStructure,
        isDM: boolean,
        data?: T
    ) {
        super(client, interaction, isDM, data);

        this.guildId = interaction.guild_id;
        this.channel = channelFactory(client, interaction.channel);
        this.channelId = interaction.channel_id;
        this.member = new GuildMember(client, interaction.member);
        this.appPermissions = interaction.app_permissions;
        this.guildLocale = interaction.guild_locale;
    }
}

interface DMInteraction<T extends InteractionData, M extends undefined | MessageStructure = undefined> extends Interaction<T, M> {
    isPingInteraction: () => this is DMInteraction<undefined>;
    isApplicationCommandInteraction: () => this is DMInteraction<ApplicationCommandData<undefined>>;
    isAutocompleteInteraction: () => this is DMInteraction<AutocompleteData>;
    isMessageComponentInteraction: () => this is DMInteraction<MessageComponentData, MessageStructure>;
    isModalSubmitInteraction: () => this is DMInteraction<ModalSubmitData>;
}

class DMInteraction<T extends InteractionData, M extends undefined | MessageStructure = undefined> extends Interaction<T, M> {
    public readonly user: User;

    public constructor(
        client: Client,
        interaction: DMInteractionStructure,
        isDM: boolean,
        data?: T
    ) {
        super(client, interaction, isDM, data);

        this.user = new User(interaction.user);
    }
}

interface GuildApplicationCommandData<T> extends ApplicationCommandData<T> {
    readonly guildId: string;
}

interface UIApplicationCommandData<T> extends ApplicationCommandData<T> {
    readonly targetId: string;
}

class ApplicationCommandData<T> {
    public readonly id: string;
    public readonly name: string;
    public readonly type: ApplicationCommandType;
    public readonly resolved?: ResolvedDataStructure;
    public readonly options: ApplicationCommandOptions<T>;
    public readonly guildId?: string;
    public readonly targetId?: string;

    public constructor(data: ApplicationCommandDataStructure) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.resolved = data.resolved;
        this.options = new ApplicationCommandOptions(data.options);
        this.guildId = data.guild_id;
        this.targetId = data.target_id;
    }

    public isGuildApplicationCommand(): this is GuildApplicationCommandData<T> {
        return typeof this.guildId !== "undefined";
    }

    public isUIApplicationCommand(): this is UIApplicationCommandData<T> {
        return typeof this.targetId !== "undefined";
    }
}

class ApplicationCommandOptions<T> {
    readonly #stringOptions = new Map<string, string | undefined>();
    readonly #numberOptions = new Map<string, number | undefined>();
    readonly #integerOptions = new Map<string, number | undefined>();
    readonly #booleanOptions = new Map<string, boolean | undefined>();
    readonly #userOptions = new Map<string, string | undefined>();
    readonly #channelOptions = new Map<string, string | undefined>();
    readonly #roleOptions = new Map<string, string | undefined>();
    readonly #mentionableOptions = new Map<string, string | undefined>();

    #focused!: T;
    #subCommandGroup: string | undefined;
    #subCommand: string | undefined;

    public constructor(options: ApplicationCommandDataStructure["options"]) {
        this.#parseOptions(options);
    }

    #parseOptions(options: ApplicationCommandDataStructure["options"]): void {
        if (!options) return;
        for (let i = 0, length = options.length; i < length; i++) {
            const option = options[i];

            if (option.focused) {
                this.#focused = <T>option.value;
                continue;
            }

            switch (option.type) {
                case ApplicationCommandOptionType.SUB_COMMAND: {
                    this.#subCommand = option.name;
                    return this.#parseOptions(option.options);
                }
                case ApplicationCommandOptionType.SUB_COMMAND_GROUP: {
                    this.#subCommandGroup = option.name;
                    return this.#parseOptions(option.options);
                }

                case ApplicationCommandOptionType.STRING: {
                    if (typeof option.value !== "string") throw new Error("Something unexpected happened");
                    this.#stringOptions.set(option.name, option.value);
                    break;
                }

                case ApplicationCommandOptionType.INTEGER: {
                    if (typeof option.value !== "number") throw new Error("Something unexpected happened");
                    this.#integerOptions.set(option.name, option.value);
                    break;
                }
                case ApplicationCommandOptionType.NUMBER: {
                    if (typeof option.value !== "number") throw new Error("Something unexpected happened");
                    this.#numberOptions.set(option.name, option.value);
                    break;
                }
                case ApplicationCommandOptionType.BOOLEAN: {
                    if (typeof option.value !== "boolean") throw new Error("Something unexpected happened");
                    this.#booleanOptions.set(option.name, option.value);
                    break;
                }
                case ApplicationCommandOptionType.USER: {
                    if (typeof option.value !== "string") throw new Error("Something unexpected happened");
                    this.#userOptions.set(option.name, option.value);
                    break;
                }
                case ApplicationCommandOptionType.CHANNEL: {
                    if (typeof option.value !== "string") throw new Error("Something unexpected happened");
                    this.#channelOptions.set(option.name, option.value);
                    break;
                }
                case ApplicationCommandOptionType.ROLE: {
                    if (typeof option.value !== "string") throw new Error("Something unexpected happened");
                    this.#roleOptions.set(option.name, option.value);
                    break;
                }
                case ApplicationCommandOptionType.MENTIONABLE: { }
                    if (typeof option.value !== "string") throw new Error("Something unexpected happened");
                    this.#mentionableOptions.set(option.name, option.value);
                    break;
                case ApplicationCommandOptionType.ATTACHMENT:
            }
        }
    }

    public get focused(): T {
        return this.#focused;
    }

    public get subCommand(): string | undefined {
        return this.#subCommand;
    }

    public get subCommandGroup(): string | undefined {
        return this.#subCommandGroup;
    }

    public getString(name: string): string | void;
    public getString(name: string, assert: true): string;
    public getString(name: string, assert: boolean = false): string | void {
        if (assert) {
            if (!this.#stringOptions.has(name)) throw new NotFoundError("String");
        }

        return this.#stringOptions.get(name);
    }

    public getNumber(name: string): number | void;
    public getNumber(name: string, assert: true): number;
    public getNumber(name: string, assert: boolean = false): number | void {
        if (assert) {
            if (!this.#numberOptions.has(name)) throw new NotFoundError("Number");
        }

        return this.#numberOptions.get(name);
    }

    public getInteger(name: string): number | void;
    public getInteger(name: string, assert: true): number;
    public getInteger(name: string, assert: boolean = false): number | void {
        if (assert) {
            if (!this.#integerOptions.has(name)) throw new NotFoundError("Integer");
        }

        return this.#integerOptions.get(name);
    }

    public getBoolean(name: string): boolean | void;
    public getBoolean(name: string, assert: true): boolean;
    public getBoolean(name: string, assert: boolean = false): boolean | void {
        if (assert) {
            if (!this.#booleanOptions.has(name)) throw new NotFoundError("Boolean");
        }

        return this.#booleanOptions.get(name);
    }

    public getUser(name: string): string | void;
    public getUser(name: string, assert: true): string;
    public getUser(name: string, assert: boolean = false): string | void {
        if (assert) {
            if (!this.#userOptions.has(name)) throw new NotFoundError("User");
        }

        return this.#userOptions.get(name);
    }

    public getChannel(name: string): string | void;
    public getChannel(name: string, assert: true): string;
    public getChannel(name: string, assert: boolean = false): string | void {
        if (assert) {
            if (!this.#channelOptions.has(name)) throw new NotFoundError("Channel");
        }

        return this.#channelOptions.get(name);
    }

    public getRole(name: string): string | void;
    public getRole(name: string, assert: true): string;
    public getRole(name: string, assert: boolean = false): string | void {
        if (assert) {
            if (!this.#roleOptions.has(name)) throw new NotFoundError("Role");
        }

        return this.#roleOptions.get(name);
    }

    public getMentionable(name: string): string | void;
    public getMentionable(name: string, assert: true): string;
    public getMentionable(name: string, assert: boolean = false): string | void {
        if (assert) {
            if (!this.#mentionableOptions.has(name)) throw new NotFoundError("Mentionable");
        }

        return this.#mentionableOptions.get(name);
    }
}

class NotFoundError extends Error {
    public constructor(type: string) {
        super();
        this.message = `${type} was not found`;
    }
}

class MessageComponentData {
    public readonly id: string;
    public readonly type: ComponentType;
    public readonly values: Array<MessageComponentValue>;
    public readonly resolved?: ResolvedDataStructure;

    public constructor(data: MessageComponentDataStructure) {
        this.id = data.custom_id;
        this.type = data.component_type;
        this.resolved = data.resolved;
        this.values = data.values?.map((val) => new MessageComponentValue(val)) ?? [];
    }
}

class MessageComponentValue {
    public readonly label: string;
    public readonly value: string;
    public readonly description: string | undefined;
    public readonly emoji: Pick<EmojiStructure, "id" | "name" | "animated"> | undefined;
    public readonly default: boolean;

    public constructor(value: SelectOptionStructure) {
        this.label = value.label;
        this.value = value.value;
        this.description = value.description;
        this.emoji = value.emoji;
        this.default = !!value.default;
    }
}

class ModalSubmitData {
    public readonly id: string;
    public readonly components: Array<MessageComponentStructure>;

    public constructor(data: ModalSubmitDataStructure) {
        this.id = data.custom_id;
        this.components = data.components;
    }
}