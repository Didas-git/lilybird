import { ThreadChannel, channelFactory } from "./factories/channel.js";
import { interactionFactory } from "./factories/interaction.js";
import { GuildMember } from "./factories/guild-member.js";
import { guildFactory } from "./factories/guild.js";
import { Message } from "./factories/message.js";
import { User } from "./factories/user.js";
import { REST } from "./http/rest.js";

import { WebSocketManager } from "#ws";
import { GatewayEvent, CollectorType } from "#enums";
import type { GuildInteraction, MessageComponentData } from "./factories/interaction.js";

import type { GuildMemberWithGuildId } from "./factories/guild-member.js";
import type { DebugFunction, DispatchFunction } from "#ws";

import type {
    UnavailableGuildStructure,
    UpdatePresenceStructure,
    ApplicationStructure,
    BaseClientOptions,
    ClientOptions
} from "./typings/index.js";

type Matcher = (interaction: GuildInteraction<MessageComponentData, Message>) => boolean;
type MatchedCallback = (interaction: GuildInteraction<MessageComponentData, Message>) => any;

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface Client {
    readonly user: User;
    readonly guilds: Array<UnavailableGuildStructure>;
    readonly sessionId: string;
    readonly application: ApplicationStructure;
}

/*
    I will probably end up making them props
    but for now we use declaration merging
    this is safe because as the library is meant to be used
    the client will always have this properties defined
    once the user can interact with it

    This however might not be true if the user
    extends the class or tries to create its own instance
*/
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class Client {
    public readonly rest: REST = new REST();

    readonly #ws: WebSocketManager;
    readonly #collectors = new Map<Matcher, { cb: MatchedCallback, timer: Timer }>();

    #cachedCollectors: Array<[Matcher, { cb: MatchedCallback, timer: Timer }]> = [];

    public constructor(options: BaseClientOptions, debug?: DebugFunction) {
        this.#ws = new WebSocketManager(
            {
                intents: options.intents,
                presence: options.presence
            },
            this.#generateListeners(options),
            debug
        );
    }

    public async login(token: string): Promise<string> {
        this.#ws.options = { token };
        this.rest.setToken(token);
        await this.#ws.connect();
        return token;
    }

    public close(): void {
        this.rest.setToken(undefined);
        this.#ws.close();
    }

    public setPresence(presence: UpdatePresenceStructure): void {
        this.#ws.updatePresence(presence);
    }

    /** Both numbers are represented in `ms` */
    public async ping(): Promise<{ ws: number, rest: number }> {
        const start = performance.now();
        await this.rest.getGateway();
        const final = Math.floor(performance.now() - start);

        return {
            ws: await this.#ws.ping(),
            rest: final
        };
    }

    public getCollector(interaction: GuildInteraction<MessageComponentData, Message>): boolean {
        for (let i = 0, { length } = this.#cachedCollectors; i < length; i++) {
            const [matcher, { cb, timer } ] = this.#cachedCollectors[i];
            if (!matcher(interaction)) continue;

            cb(interaction);
            clearTimeout(timer);
            this.#collectors.delete(matcher);

            return true;
        }

        return false;
    }

    public addCollector(
        matcher: Matcher,
        callback: MatchedCallback,
        time: number = 30000
    ): void {
        this.#collectors.set(matcher, { cb: callback, timer: setTimeout(() => { this.#collectors.delete(matcher); }, time) });
        this.#cachedCollectors = [...this.#collectors.entries()];
    }

    public createComponentCollector(type: CollectorType.USER | CollectorType.BUTTON_ID, id: string, callback: MatchedCallback): void;
    public createComponentCollector(type: CollectorType.BOTH, userId: string, buttonId: string, callback: MatchedCallback): void;
    public createComponentCollector(
        type: CollectorType,
        idOrFilter: string,
        idOrCallback: string | MatchedCallback,
        bothCallback?: MatchedCallback
    ): void {
        switch (type) {
            case CollectorType.USER: {
                if (typeof idOrCallback === "string") return;
                this.addCollector((int) => int.member.user.id === idOrFilter, idOrCallback);
                break;
            }
            case CollectorType.BUTTON_ID: {
                if (typeof idOrCallback === "string") return;
                this.addCollector((int) => int.data.id === idOrFilter, idOrCallback);
                break;
            }
            case CollectorType.BOTH: {
                if (typeof bothCallback === "undefined") return;
                this.addCollector((int) => int.data.id === idOrCallback && int.member.user.id === idOrFilter, bothCallback);
                break;
            }
        }
    }

    //! Pending: Compiled listeners based on the options instead of accessing arbitrary keys
    #generateListeners(options: BaseClientOptions): DispatchFunction {
        return async (data) => {
            await options.listeners.raw?.(data.d);

            switch (data.t) {
                case GatewayEvent.Ready: {
                    Object.assign(this, {
                        user: new User(this, data.d.user),
                        guilds: data.d.guilds,
                        sessionId: data.d.session_id,
                        application: data.d.application
                    });

                    Object.assign(this.#ws.resumeInfo, {
                        url: data.d.resume_gateway_url,
                        id: data.d.session_id
                    });

                    await options.setup?.(this);

                    await options.listeners.ready?.(this, data.d);
                    break;
                }
                case GatewayEvent.Resumed: {
                    await options.listeners.resumed?.(this);
                    break;
                }
                case GatewayEvent.ChannelCreate: {
                    await options.listeners.channelCreate?.(channelFactory(this, data.d));
                    break;
                }
                case GatewayEvent.ChannelUpdate: {
                    await options.listeners.channelUpdate?.(channelFactory(this, data.d));
                    break;
                }
                case GatewayEvent.ChannelDelete: {
                    await options.listeners.channelDelete?.(channelFactory(this, data.d));
                    break;
                }
                case GatewayEvent.ChannelPinsUpdate: {
                    await options.listeners.channelPinsUpdate?.(
                        data.d.guild_id,
                        data.d.channel_id,
                        typeof data.d.last_pin_timestamp === "string" ? new Date(data.d.last_pin_timestamp) : null
                    );
                    break;
                }
                case GatewayEvent.ThreadCreate: {
                    await options.listeners.threadCreate?.(<never>channelFactory(this, data.d));
                    break;
                }
                case GatewayEvent.ThreadUpdate: {
                    await options.listeners.threadUpdate?.(channelFactory(this, data.d));
                    break;
                }
                case GatewayEvent.ThreadDelete: {
                    await options.listeners.threadDelete?.(new ThreadChannel(this, <never>data.d, false));
                    break;
                }
                case GatewayEvent.GuildCreate: {
                    await options.listeners.guildCreate?.(guildFactory(this, data.d));
                    break;
                }
                case GatewayEvent.GuildUpdate: {
                    await options.listeners.guildUpdate?.(guildFactory(this, data.d));
                    break;
                }
                case GatewayEvent.GuildDelete: {
                    await options.listeners.guildDelete?.(data.d);
                    break;
                }
                case GatewayEvent.GuildMemberAdd: {
                    await options.listeners.guildMemberAdd?.(<GuildMemberWithGuildId> new GuildMember(this, data.d));
                    break;
                }
                case GatewayEvent.GuildMemberRemove: {
                    await options.listeners.guildMemberRemove?.(data.d.guild_id, new User(this, data.d.user));
                    break;
                }
                case GatewayEvent.GuildMemberUpdate: {
                    await options.listeners.guildMemberUpdate?.(<GuildMemberWithGuildId> new GuildMember(this, <never>data.d));
                    break;
                }
                case GatewayEvent.InteractionCreate: {
                    const interaction = interactionFactory(this, data.d);
                    if (interaction.isMessageComponentInteraction() && interaction.inGuild())
                        if (this.getCollector(interaction)) break;

                    await options.listeners.interactionCreate?.(interaction);
                    break;
                }
                case GatewayEvent.InviteCreate: {
                    await options.listeners.inviteCreate?.(data.d);
                    break;
                }
                case GatewayEvent.InviteDelete: {
                    await options.listeners.inviteDelete?.(data.d);
                    break;
                }
                case GatewayEvent.MessageCreate: {
                    await options.listeners.messageCreate?.(new Message(this, data.d));
                    break;
                }
                case GatewayEvent.MessageUpdate: {
                    await options.listeners.messageUpdate?.(new Message(this, <never>data.d));
                    break;
                }
                case GatewayEvent.MessageDelete: {
                    await options.listeners.messageDelete?.(new Message(this, <never>data.d));
                    break;
                }
                case GatewayEvent.MessageDeleteBulk: {
                    await options.listeners.messageDeleteBulk?.(data.d);
                    break;
                }
                case GatewayEvent.PresenceUpdate: {
                    await options.listeners.presenceUpdate?.(data.d);
                    break;
                }
                case GatewayEvent.UserUpdate: {
                    await options.listeners.userUpdate?.(new User(this, data.d));
                    break;
                }
                default:
            }
        };
    }
}

export async function createClient(options: ClientOptions): Promise<Client> {
    return new Promise((res) => {
        // This is a promise executer, it doesn't need to be async
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        new Client(
            {
                intents: options.intents.reduce((prev, curr) => prev | curr, 0),
                listeners: options.listeners,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                setup: typeof options.setup !== "undefined" ? async (client) => { await options.setup!(client); res(client); } : res
            },
            options.attachDebugListener
                ? options.debugListener ?? ((identifier, payload) => {
                    console.log(identifier, payload ?? "");
                })
                : undefined
        ).login(options.token);
    });
}
