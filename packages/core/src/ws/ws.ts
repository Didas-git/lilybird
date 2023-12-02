import { GatewayEvent, GatewayOpCode } from "../enums";
import { closeCodeAllowsReconnection } from "./utils";

import type { UpdatePresenceStructure, GetGatewayBotResponse, ReceiveDispatchEvent, Identify, Payload, Resume } from "../typings/gateway-events";

interface ManagerOptions {
    token?: string;
    intents: number;
    presence?: UpdatePresenceStructure;
}

export type DispatchFunction = (data: ReceiveDispatchEvent) => any;
export type DebugFunction = (data: string, payload?: unknown) => any;

export class WebSocketManager {
    readonly #dispatch: DispatchFunction;
    readonly #debug: DebugFunction | undefined;

    #sequenceNumber: number | null = null;
    #isResuming = false;
    #ws!: WebSocket;
    #gatewayInfo!: GetGatewayBotResponse;
    #options: Required<ManagerOptions>;
    //@ts-expect-error Ignore for now
    #resumeInfo: {
        url: string;
        id: string;
    };

    public constructor(options: ManagerOptions, dispatch: DispatchFunction, debug?: DebugFunction) {
        if (!options.intents) {
            throw new Error("No intents were passed");
        }

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
                    Authorization: `Bot ${this.#options.token}`,
                },
            });

            if (!response.ok) {
                throw new Error("An invalid Token was provided");
            }

            const data = await response.json();

            data.url = `${data.url}/?v=10&encoding=json`;
            this.#gatewayInfo = data;
        }

        this.#ws = new WebSocket(url ?? this.#gatewayInfo.url);
        this.#ws.addEventListener("error", (err) => {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw err;
        });
        this.#ws.addEventListener("close", ({ code, reason }) => {
            if (typeof code === "undefined") {
                this.#attemptResume();
            } else if (code === 1000) {
                process.exit();
            } else if (code === 3000) {
                this.#isResuming = false;
                this.connect();
            } else if (closeCodeAllowsReconnection(code)) {
                this.#attemptResume();
            }

            throw new Error(`${code}: ${reason.toString()}`);
        });
        this.#ws.addEventListener("message", (event) => {
            this.#debug?.("Received:", event.data);
            const payload: Payload = JSON.parse(event.data.toString());
            if (typeof payload.s === "number") {
                this.#sequenceNumber = payload.s;
            }

            switch (payload.op) {
                case GatewayOpCode.Dispatch: {
                    if (payload.t === GatewayEvent.Ready) {
                        this.#resumeInfo = {
                            url: payload.d.resume_gateway_url,
                            id: payload.d.session_id,
                        };
                    }

                    this.#dispatch(payload);
                    break;
                }
                case GatewayOpCode.Hello: {
                    const interval = Math.round(payload.d.heartbeat_interval * Math.random());

                    setInterval(() => {
                        this.#debug?.("Sending Heartbeat");
                        this.#sendHeartbeatPayload();
                    }, interval);

                    if (!this.#isResuming) {
                        this.#identify();
                    }

                    break;
                }
                case GatewayOpCode.Heartbeat: {
                    this.#debug?.("Discord asked for a Heartbeat");
                    this.#sendHeartbeatPayload();
                    break;
                }
                case GatewayOpCode.Reconnect: {
                    this.#attemptResume();
                    break;
                }
                case GatewayOpCode.InvalidSession: {
                    if (payload.d) {
                        this.#attemptResume();
                    } else {
                        this.#ws.close(3000);
                    }
                    break;
                }
                case GatewayOpCode.HeartbeatACK: {
                    this.#debug?.("ACK:", payload);
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
        if (typeof this.#options.token === "undefined") {
            throw new Error("No token was found");
        }

        const payload: Identify = {
            op: GatewayOpCode.Identify,
            d: {
                token: this.#options.token,
                intents: this.#options.intents,
                properties: {
                    os: process.platform,
                    browser: "LilyBird",
                    device: "LilyBird",
                },
                presence: this.#options.presence,
            },
            s: null,
            t: null,
        };

        this.#ws.send(JSON.stringify(payload));
        this.#debug?.("Identify Called");
    }

    #attemptResume(): void {
        this.#isResuming = true;
        const payload: Resume = {
            op: GatewayOpCode.Resume,
            d: {
                token: this.#options.token,
                session_id: this.#resumeInfo.id,
                seq: <number>this.#sequenceNumber,
            },
            s: null,
            t: null,
        };

        this.connect(this.#resumeInfo.url);
        this.#ws.send(JSON.stringify(payload));
    }

    /** Returns time taken in ms */
    public async ping(): Promise<number> {
        return new Promise((res) => {
            this.#ws.addEventListener(
                "pong",
                () => {
                    res(Math.round(performance.now() - start));
                },
                { once: true },
            );

            const start = performance.now();
            this.#ws.ping();
        });
    }

    public set options(options: Partial<ManagerOptions>) {
        this.#options = { ...this.#options, ...options };
    }
}
