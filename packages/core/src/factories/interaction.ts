/* eslint-disable @typescript-eslint/naming-convention */
import { ApplicationCommandOptionType, InteractionCallbackType, InteractionType, MessageFlags } from "../enums";
import { channelFactory } from "./channel";
import { GuildMember } from "./guild";
import { Message } from "./message";
import { User } from "./user";
import type { PartialChannel } from "./channel";
import type { Client } from "../client";
import type { ApplicationCommandType, ComponentType, Locale } from "../enums";
import type {
    AutocompleteCallbackDataStructure,
    ApplicationCommandDataStructure,
    MessageComponentDataStructure,
    GuildInteractionStructure,
    MessageComponentStructure,
    ModalSubmitDataStructure,
    InteractionCallbackData,
    DMInteractionStructure,
    SelectOptionStructure,
    ResolvedDataStructure,
    EntitlementStructure,
    InteractionStructure,
    MessageStructure,
    EmojiStructure,
    ReplyOptions
} from "../typings";

export function interactionFactory(client: Client, interaction: InteractionStructure): Interaction<InteractionData> {
    const data = interactionDataFactory(interaction);
    // No clue why eslint is flagging this as an error with classes set to false...
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    if ("guild_id" in interaction) return new GuildInteraction(client, interaction, true, data);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new DMInteraction(client, interaction, false, data);
}

function interactionDataFactory(interaction: InteractionStructure): InteractionData {
    switch (interaction.type) {
        case InteractionType.PING:
            return undefined;
        case InteractionType.APPLICATION_COMMAND:
        case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE: {
            return new ApplicationCommandData(interaction.data) as never;
        }
        case InteractionType.MESSAGE_COMPONENT: {
            return new MessageComponentData(interaction.data);
        }
        case InteractionType.MODAL_SUBMIT: {
            return new ModalSubmitData(interaction.data);
        }
    }
}

export type InteractionData = ApplicationCommandData | AutocompleteData | MessageComponentData | ModalSubmitData | undefined;

export interface AutocompleteData extends ApplicationCommandData<FocusedOption> {}

export interface InteractionReplyOptions extends ReplyOptions {
    ephemeral?: boolean;
    tts?: boolean;
    suppressEmbeds?: boolean;
}

// biome-ignore lint/suspicious/noEmptyInterface: This is for future proofing
export interface InteractionEditOptions extends ReplyOptions {}

export class Interaction<T extends InteractionData, M extends undefined | MessageStructure = undefined> {
    public readonly client: Client;
    public readonly id: string;
    public readonly applicationId: string;
    public readonly type: InteractionType;
    public readonly token: string;
    public readonly version = 1;
    /** This is only undefined if type is PING */
    public readonly locale: Locale | undefined;
    public readonly entitlements: Array<EntitlementStructure>;
    public readonly data: T;
    public readonly message: M = <M>undefined;

    readonly #inGuild: boolean;

    protected constructor(client: Client, interaction: GuildInteractionStructure | DMInteractionStructure, isGuild: boolean, data?: T) {
        this.#inGuild = isGuild;

        this.client = client;
        this.id = interaction.id;
        this.applicationId = interaction.application_id;
        this.type = interaction.type;
        this.token = interaction.token;
        this.locale = interaction.locale;
        this.entitlements = interaction.entitlements;

        this.data = <never>data;

        if ("message" in interaction) this.message = <never>interaction.message;
    }

    public async reply(content: string, options?: InteractionReplyOptions): Promise<void>;
    public async reply(options: InteractionReplyOptions): Promise<void>;
    public async reply(content: string | InteractionReplyOptions, options?: InteractionReplyOptions): Promise<void> {
        let flags = 0;
        let data: InteractionCallbackData;

        if (typeof content === "string") {
            if (typeof options !== "undefined") {
                const { ephemeral, suppressEmbeds, ...obj } = options;

                if (ephemeral) flags |= MessageFlags.EPHEMERAL;
                if (suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;

                data = {
                    ...obj,
                    content,
                    flags
                };
            } else {
                data = {
                    content,
                    flags
                };
            }
        } else {
            const { ephemeral, suppressEmbeds, ...obj } = content;

            if (ephemeral) flags |= MessageFlags.EPHEMERAL;
            if (suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;

            data = {
                ...obj,
                flags
            };
        }

        await this.client.rest.createInteractionResponse(this.id, this.token, {
            type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
            data
        });
    }

    public async respond(choices: AutocompleteCallbackDataStructure["choices"]): Promise<void> {
        await this.client.rest.createInteractionResponse(this.id, this.token, {
            type: InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
            data: { choices }
        });
    }

    public async deferReply(ephemeral = false): Promise<void> {
        await this.client.rest.createInteractionResponse(this.id, this.token, {
            type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                flags: ephemeral ? MessageFlags.EPHEMERAL : 0
            }
        });
    }

    public async followUp(content: string, options?: InteractionReplyOptions): Promise<Message>;
    public async followUp(options: InteractionReplyOptions): Promise<Message>;
    public async followUp(content: string | InteractionReplyOptions, options?: InteractionReplyOptions): Promise<Message> {
        let flags = 0;

        let data: InteractionCallbackData;

        if (typeof content === "string") {
            if (typeof options !== "undefined") {
                const { ephemeral, suppressEmbeds, ...obj } = options;

                if (ephemeral) flags |= MessageFlags.EPHEMERAL;
                if (suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;

                data = {
                    ...obj,
                    content,
                    flags
                };
            } else {
                data = {
                    content,
                    flags
                };
            }
        } else {
            const { ephemeral, suppressEmbeds, ...obj } = content;

            if (ephemeral) flags |= MessageFlags.EPHEMERAL;
            if (suppressEmbeds) flags |= MessageFlags.SUPPRESS_EMBEDS;

            data = {
                ...obj,
                flags
            };
        }

        return new Message(this.client, await this.client.rest.createFollowupMessage(this.client.user.id, this.token, data));
    }

    public async editReply(content: string, options?: InteractionEditOptions): Promise<void>;
    public async editReply(options: InteractionEditOptions): Promise<void>;
    public async editReply(content: string | InteractionEditOptions, options?: InteractionEditOptions): Promise<void> {
        await this.client.rest.editOriginalInteractionResponse(
            this.client.user.id,
            this.token,
            typeof content === "string"
                ? {
                    content,
                    ...options
                }
                : content
        );
    }

    public async editFollowUp(messageId: string, content: string, options?: InteractionEditOptions): Promise<void>;
    public async editFollowUp(messageId: string, options: InteractionEditOptions): Promise<void>;
    public async editFollowUp(messageId: string, content: string | InteractionEditOptions, options?: InteractionEditOptions): Promise<void> {
        await this.client.rest.editFollowupMessage(
            this.client.user.id,
            this.token,
            messageId,
            typeof content === "string"
                ? {
                    content,
                    ...options
                }
                : content
        );
    }

    public async deleteReply(): Promise<void> {
        await this.client.rest.deleteOriginalInteractionResponse(this.client.application.id, this.token);
    }

    public async deleteFollowUp(messageId: string): Promise<void> {
        await this.client.rest.deleteFollowupMessage(this.client.application.id, this.token, messageId);
    }

    public isPingInteraction(): this is Interaction<undefined> {
        return this.type === InteractionType.PING;
    }

    public isApplicationCommandInteraction(): this is Interaction<ApplicationCommandData> {
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

export interface GuildInteraction<T extends InteractionData, M extends undefined | MessageStructure = undefined> extends Interaction<T, M> {
    isPingInteraction: () => this is GuildInteraction<undefined>;
    isApplicationCommandInteraction: () => this is GuildInteraction<ApplicationCommandData>;
    isAutocompleteInteraction: () => this is GuildInteraction<AutocompleteData>;
    isMessageComponentInteraction: () => this is GuildInteraction<MessageComponentData, MessageStructure>;
    isModalSubmitInteraction: () => this is GuildInteraction<ModalSubmitData>;
}

/*
    This is intended we only want to override the types
    without getting any runtime penalty for doing it on the class
*/
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class GuildInteraction<T extends InteractionData, M extends undefined | MessageStructure = undefined> extends Interaction<T, M> {
    public readonly guildId: string;
    public readonly channel: PartialChannel;
    public readonly channelId: string;
    public readonly member: GuildMember;
    public readonly appPermissions: string;
    public readonly guildLocale: Locale;

    public constructor(client: Client, interaction: GuildInteractionStructure, isDM: boolean, data?: T) {
        super(client, interaction, isDM, data);

        this.guildId = interaction.guild_id;
        this.channel = channelFactory(client, interaction.channel);
        this.channelId = interaction.channel_id;
        this.member = new GuildMember(client, interaction.member);
        this.appPermissions = interaction.app_permissions;
        this.guildLocale = interaction.guild_locale;
    }
}

export interface DMInteraction<T extends InteractionData, M extends undefined | MessageStructure = undefined> extends Interaction<T, M> {
    isPingInteraction: () => this is DMInteraction<undefined>;
    isApplicationCommandInteraction: () => this is DMInteraction<ApplicationCommandData>;
    isAutocompleteInteraction: () => this is DMInteraction<AutocompleteData>;
    isMessageComponentInteraction: () => this is DMInteraction<MessageComponentData, MessageStructure>;
    isModalSubmitInteraction: () => this is DMInteraction<ModalSubmitData>;
}

/*
    This is intended we only want to override the types
    without getting any runtime penalty for doing it on the class
*/
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class DMInteraction<T extends InteractionData, M extends undefined | MessageStructure = undefined> extends Interaction<T, M> {
    public readonly user: User;

    public constructor(client: Client, interaction: DMInteractionStructure, isDM: boolean, data?: T) {
        super(client, interaction, isDM, data);

        this.user = new User(client, interaction.user);
    }
}

interface GuildApplicationCommandData<T extends undefined | FocusedOption> extends ApplicationCommandData<T> {
    readonly guildId: string;
}

interface UIApplicationCommandData<T extends undefined | FocusedOption> extends ApplicationCommandData<T> {
    readonly targetId: string;
}

export class ApplicationCommandData<T extends undefined | FocusedOption = undefined> {
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

interface FocusedOption<T extends string | number | boolean = string | number | boolean> {
    name: string;
    value: T;
}

type ParseFocusedReturnType<T extends undefined | FocusedOption, F extends string | number | boolean> = T extends undefined ? undefined : FocusedOption<F>;

class ApplicationCommandOptions<T extends undefined | FocusedOption> {
    readonly #stringOptions = new Map<string, string | undefined>();
    readonly #numberOptions = new Map<string, number | undefined>();
    readonly #integerOptions = new Map<string, number | undefined>();
    readonly #booleanOptions = new Map<string, boolean | undefined>();
    readonly #userOptions = new Map<string, string | undefined>();
    readonly #channelOptions = new Map<string, string | undefined>();
    readonly #roleOptions = new Map<string, string | undefined>();
    readonly #mentionableOptions = new Map<string, string | undefined>();

    #focused!: FocusedOption;
    #subCommandGroup: string | undefined;
    #subCommand: string | undefined;

    public constructor(options: ApplicationCommandDataStructure["options"]) {
        this.#parseOptions(options);
    }

    #parseOptions(options: ApplicationCommandDataStructure["options"]): void {
        if (!options) return;

        for (let i = 0, { length } = options; i < length; i++) {
            const option = options[i];

            if (option.focused) {
                if (typeof option.value === "undefined") continue;
                this.#focused = { name: option.name, value: option.value };
                continue;
            }

            switch (option.type) {
                case ApplicationCommandOptionType.SUB_COMMAND: {
                    this.#subCommand = option.name;
                    this.#parseOptions(option.options);
                    return;
                }
                case ApplicationCommandOptionType.SUB_COMMAND_GROUP: {
                    this.#subCommandGroup = option.name;
                    this.#parseOptions(option.options);
                    return;
                }

                case ApplicationCommandOptionType.STRING: {
                    if (typeof option.value !== "string")
                        throw new Error("Something unexpected happened");

                    this.#stringOptions.set(option.name, option.value);
                    break;
                }

                case ApplicationCommandOptionType.INTEGER: {
                    if (typeof option.value !== "number")
                        throw new Error("Something unexpected happened");

                    this.#integerOptions.set(option.name, option.value);
                    break;
                }
                case ApplicationCommandOptionType.NUMBER: {
                    if (typeof option.value !== "number")
                        throw new Error("Something unexpected happened");

                    this.#numberOptions.set(option.name, option.value);
                    break;
                }
                case ApplicationCommandOptionType.BOOLEAN: {
                    if (typeof option.value !== "boolean")
                        throw new Error("Something unexpected happened");

                    this.#booleanOptions.set(option.name, option.value);
                    break;
                }
                case ApplicationCommandOptionType.USER: {
                    if (typeof option.value !== "string")
                        throw new Error("Something unexpected happened");

                    this.#userOptions.set(option.name, option.value);
                    break;
                }
                case ApplicationCommandOptionType.CHANNEL: {
                    if (typeof option.value !== "string")
                        throw new Error("Something unexpected happened");

                    this.#channelOptions.set(option.name, option.value);
                    break;
                }
                case ApplicationCommandOptionType.ROLE: {
                    if (typeof option.value !== "string")
                        throw new Error("Something unexpected happened");

                    this.#roleOptions.set(option.name, option.value);
                    break;
                }
                case ApplicationCommandOptionType.MENTIONABLE: {
                    if (typeof option.value !== "string")
                        throw new Error("Something unexpected happened");

                    this.#mentionableOptions.set(option.name, option.value);
                    break;
                }
                case ApplicationCommandOptionType.ATTACHMENT:
            }
        }
    }

    public getFocused<F extends string | number | boolean = string | number | boolean>(): ParseFocusedReturnType<T, F> {
        return this.#focused as never;
    }

    public get subCommand(): string | undefined {
        return this.#subCommand;
    }

    public get subCommandGroup(): string | undefined {
        return this.#subCommandGroup;
    }

    public getString(name: string): string | undefined;
    public getString(name: string, assert: true): string;
    public getString(name: string, assert = false): string | undefined {
        if (assert)
            if (!this.#stringOptions.has(name)) throw new NotFoundError("String");

        return this.#stringOptions.get(name);
    }

    public getNumber(name: string): number | undefined;
    public getNumber(name: string, assert: true): number;
    public getNumber(name: string, assert = false): number | undefined {
        if (assert)
            if (!this.#numberOptions.has(name)) throw new NotFoundError("Number");

        return this.#numberOptions.get(name);
    }

    public getInteger(name: string): number | undefined;
    public getInteger(name: string, assert: true): number;
    public getInteger(name: string, assert = false): number | undefined {
        if (assert)
            if (!this.#integerOptions.has(name)) throw new NotFoundError("Integer");

        return this.#integerOptions.get(name);
    }

    public getBoolean(name: string): boolean | undefined;
    public getBoolean(name: string, assert: true): boolean;
    public getBoolean(name: string, assert = false): boolean | undefined {
        if (assert)
            if (!this.#booleanOptions.has(name)) throw new NotFoundError("Boolean");

        return this.#booleanOptions.get(name);
    }

    public getUser(name: string): string | undefined;
    public getUser(name: string, assert: true): string;
    public getUser(name: string, assert = false): string | undefined {
        if (assert)
            if (!this.#userOptions.has(name)) throw new NotFoundError("User");

        return this.#userOptions.get(name);
    }

    public getChannel(name: string): string | undefined;
    public getChannel(name: string, assert: true): string;
    public getChannel(name: string, assert = false): string | undefined {
        if (assert)
            if (!this.#channelOptions.has(name)) throw new NotFoundError("Channel");

        return this.#channelOptions.get(name);
    }

    public getRole(name: string): string | undefined;
    public getRole(name: string, assert: true): string;
    public getRole(name: string, assert = false): string | undefined {
        if (assert)
            if (!this.#roleOptions.has(name)) throw new NotFoundError("Role");

        return this.#roleOptions.get(name);
    }

    public getMentionable(name: string): string | undefined;
    public getMentionable(name: string, assert: true): string;
    public getMentionable(name: string, assert = false): string | undefined {
        if (assert)
            if (!this.#mentionableOptions.has(name)) throw new NotFoundError("Mentionable");

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
