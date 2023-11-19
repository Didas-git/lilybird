import { type DebugFunction, WebSocketManager } from "./ws/ws";
import { interactionFactory } from "./factories/interaction";
import { channelFactory } from "./factories/channel";
import { User } from "./factories/user";
import { GatewayEvent } from "./enums";
import { REST } from "./rest/rest";

import type { BaseClientOptions, UserStructure } from "./typings";

export interface Client extends UserStructure { }

export class Client {
    public readonly rest: REST = new REST();

    readonly #ws: WebSocketManager;

    public constructor(
        res: (client: Client) => void,
        options: BaseClientOptions,
        debug?: DebugFunction
    ) {
        if (Array.isArray(options.intents)) {
            options.intents = options.intents.reduce((prev, curr) => prev | curr, 0);
        }

        this.#ws = new WebSocketManager({
            intents: options.intents
        }, async (data) => {
            await options.listeners.raw?.(data.d);

            switch (data.t) {
                case GatewayEvent.Ready: {
                    Object.assign(this, data.d.user);
                    await options.setup?.(this);
                    res(this);
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
                case GatewayEvent.ThreadUpdate: {
                    await options.listeners.threadUpdate?.(channelFactory(this, data.d));
                    break;
                }
                case GatewayEvent.UserUpdate: {
                    await options.listeners.userUpdate?.(new User(data.d));
                    break;
                }
                case GatewayEvent.InteractionCreate: {
                    await options.listeners.interactionCreate?.(interactionFactory(this, data.d));
                    break;
                }
                default:
            }
        }, debug);
    }

    public async login(token: string): Promise<string> {
        this.#ws.options = { token };
        this.rest.setToken(token);
        await this.#ws.connect();
        return token;
    }

    public close(): void {
        this.rest.setToken(void 0);
        this.#ws.close();
    }
}