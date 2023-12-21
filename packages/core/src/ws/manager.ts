import { GatewayOpCode } from "../enums/index.js";

import type {
    UpdatePresenceStructure,
    GetGatewayBotResponse,
    ReceiveDispatchEvent,
    GetGatewayBot,
    Identify,
    Payload,
    Resume
} from "../typings/index.js";

interface ManagerOptions {
    token?: string;
    intents: number;
    presence?: UpdatePresenceStructure;
}

export type Identifier = "WS_MESSAGE" | "HEARTBEAT" | "ACK" | "NEED_HEARTBEAT" | "IDENTIFY";

export type DispatchFunction = (data: ReceiveDispatchEvent) => any;
export type DebugFunction = (identifier: Identifier, payload?: unknown) => any;

export class WebSocketManager {
    readonly #dispatch: DispatchFunction;
    readonly #debug: DebugFunction | undefined;

    #sequenceNumber: number | null = null;
    #isResuming = false;
    #ws!: WebSocket;
    #gatewayInfo!: GetGatewayBotResponse;
    #options: Required<ManagerOptions>;

    private readonly resumeInfo: {
        url: string,
        id: string
    } = <never>{};

    public constructor(options: ManagerOptions, dispatch: DispatchFunction, debug?: DebugFunction) {
        if (!options.intents) throw new Error("No intents were passed");

        this.#dispatch = dispatch;
        this.#debug = debug;
        this.#options = <never>options;
    }

    public close(): void {
        this.#ws.close(1000);
    }

    public async connect(url?: string): Promise<void> {
        if (typeof this.#gatewayInfo === "undefined") {
            const response = await fetch("https://discord.com/api/v10/gateway/bot", {
                headers: {
                    Authorization: `Bot ${this.#options.token}`
                }
            });

            if (!response.ok) throw new Error("An invalid Token was provided");

            const data: GetGatewayBot = await response.json();

            data.url = `${data.url}/?v=10&encoding=json`;
            this.#gatewayInfo = data;
        }

        this.#ws = new WebSocket(url ?? this.#gatewayInfo.url);
        this.#ws.addEventListener("error", (err) => {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw err;
        });
        this.#ws.addEventListener("close", async ({ code, reason }) => {
            if (typeof code === "undefined")
                await this.#attemptResume();
            else if (code === 1000)
                process.exit();
            else if (code === 3000) {
                this.#isResuming = false;
                await this.connect();
            } else if (closeCodeAllowsReconnection(code))
                await this.#attemptResume();

            throw new Error(`${code}: ${reason.toString()}`);
        });
        this.#ws.addEventListener("message", async (event) => {
            this.#debug?.("WS_MESSAGE", event.data);
            const payload = <Payload>JSON.parse(event.data.toString());
            if (typeof payload.s === "number") this.#sequenceNumber = payload.s;

            switch (payload.op) {
                case GatewayOpCode.Dispatch: {
                    this.#dispatch(payload);
                    break;
                }
                case GatewayOpCode.Hello: {
                    const interval = Math.round(payload.d.heartbeat_interval * Math.random());

                    setInterval(() => {
                        this.#debug?.("HEARTBEAT");
                        this.#sendHeartbeatPayload();
                    }, interval);

                    if (!this.#isResuming) this.#identify();

                    break;
                }
                case GatewayOpCode.Heartbeat: {
                    this.#debug?.("NEED_HEARTBEAT");
                    this.#sendHeartbeatPayload();
                    break;
                }
                case GatewayOpCode.Reconnect: {
                    await this.#attemptResume();
                    break;
                }
                case GatewayOpCode.InvalidSession: {
                    if (payload.d) await this.#attemptResume();
                    else this.#ws.close(3000);
                    break;
                }
                case GatewayOpCode.HeartbeatACK: {
                    this.#debug?.("ACK", payload);
                    break;
                }
                default:
                    break;
            }

            return;
        });
    }

    #sendHeartbeatPayload(): void {
        this.#ws.send(`{ "op": ${GatewayOpCode.Heartbeat}, "d": ${this.#sequenceNumber}, "s": null, "t": null }`);
    }

    #identify(): void {
        if (typeof this.#options.token === "undefined") throw new Error("No token was found");

        const payload: Identify = {
            op: GatewayOpCode.Identify,
            d: {
                token: this.#options.token,
                intents: this.#options.intents,
                properties: {
                    os: process.platform,
                    browser: "LilyBird",
                    device: "LilyBird"
                },
                presence: this.#options.presence
            },
            s: null,
            t: null
        };

        this.#ws.send(JSON.stringify(payload));
        this.#debug?.("IDENTIFY");
    }

    async #attemptResume(): Promise<void> {
        this.#isResuming = true;
        const payload: Resume = {
            op: GatewayOpCode.Resume,
            d: {
                token: this.#options.token,
                session_id: this.resumeInfo.id,
                seq: this.#sequenceNumber ?? 0
            },
            s: null,
            t: null
        };

        await this.connect(this.resumeInfo.url);
        this.#ws.send(JSON.stringify(payload));
    }

    /** Returns time taken in ms */
    public async ping(): Promise<number> {
        return new Promise((res) => {
            this.#ws.addEventListener(
                "pong",
                () => {
                    // It is defined, this is a massive hack
                    // eslint-disable-next-line @typescript-eslint/no-use-before-define
                    res(Math.round(performance.now() - start));
                },
                { once: true }
            );

            const start = performance.now();
            this.#ws.ping();
        });
    }

    public set options(options: Partial<ManagerOptions>) {
        this.#options = { ...this.#options, ...options };
    }

    public get options(): ManagerOptions {
        return this.#options;
    }
}

function closeCodeAllowsReconnection(code: number): boolean {
    return code >= 4000 && code !== 4004 && code < 4010;
}
