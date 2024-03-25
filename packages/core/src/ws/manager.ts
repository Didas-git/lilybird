import { GatewayOpCode } from "#enums";
import { setTimeout } from "node:timers/promises";

import type {
    UpdatePresenceStructure,
    GetGatewayBotResponse,
    ReceiveDispatchEvent,
    UpdatePresence,
    Identify,
    Payload,
    Resume
} from "../typings/index.js";

interface ManagerOptions {
    token?: string;
    intents: number;
    presence?: UpdatePresenceStructure;
}

export type DebugIdentifier = "WS_MESSAGE"
    | "HEARTBEAT"
    | "ACK"
    | "NEED_HEARTBEAT"
    | "IDENTIFY"
    | "RESUME"
    | "INVALID_SESSION"
    | "RECONNECT"
    | "ERROR"
    | "MISSING_ACK"
    | "ZOMBIE"
    | "ATTEMPTING_RESUME"
    | "UNKNOWN_CODE"
    | "LISTENERS";

export type DispatchFunction = (data: ReceiveDispatchEvent) => any;
export type DebugFunction = (identifier: DebugIdentifier, payload?: unknown) => any;

export class WebSocketManager {
    readonly #dispatch: DispatchFunction;
    readonly #debug: DebugFunction | undefined;

    #sequenceNumber: number | null = null;
    #isResuming = false;
    #ws!: WebSocket;
    #gatewayInfo!: GetGatewayBotResponse;
    #options: Required<ManagerOptions>;
    #timer?: Timer;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    #gotACK: boolean = true;

    // Should i use symbols...?
    public readonly resumeInfo: {
        url: string,
        id: string
    } = <never>{};

    public constructor(options: ManagerOptions, dispatch: DispatchFunction, debug?: DebugFunction) {
        if (typeof options.intents !== "number" && Number.isNaN(options.intents)) throw new Error("Invalid intents");

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

            const data: GetGatewayBotResponse = await response.json() as never;

            data.url = `${data.url}/?v=10&encoding=json`;
            this.#gatewayInfo = data;
        }

        this.#ws = new WebSocket(url ?? this.#gatewayInfo.url);
        this.#ws.addEventListener("error", (err) => {
            this.#debug?.("ERROR", err);
        });
        this.#ws.addEventListener("close", async ({ code }) => {
            this.#clearTimer();
            if (typeof code === "undefined" || code === 1001 || closeCodeAllowsReconnection(code)) {
                await this.#attemptResume();
                return;
            }

            this.#debug?.("UNKNOWN_CODE", code);
            this.#isResuming = false;
            await this.connect();
        });
        this.#ws.addEventListener("message", (event) => {
            this.#debug?.("WS_MESSAGE", event.data);
            const payload = <Payload>JSON.parse((event.data as Buffer).toString());
            if (typeof payload.s === "number") this.#sequenceNumber = payload.s;

            switch (payload.op) {
                case GatewayOpCode.Dispatch: {
                    this.#dispatch(payload);
                    break;
                }
                case GatewayOpCode.Hello: {
                    const interval = Math.round(payload.d.heartbeat_interval * Math.random());
                    this.#startTimer(interval);

                    if (!this.#isResuming) this.#identify();
                    else this.#resume();

                    break;
                }
                case GatewayOpCode.Heartbeat: {
                    this.#debug?.("NEED_HEARTBEAT");
                    this.#sendHeartbeatPayload();
                    break;
                }
                case GatewayOpCode.Reconnect: {
                    this.#debug?.("RECONNECT");
                    this.#ws.close(1001);
                    break;
                }
                case GatewayOpCode.InvalidSession: {
                    this.#debug?.("INVALID_SESSION");
                    if (payload.d) this.#ws.close(1001);
                    else this.#ws.close(1000);
                    break;
                }
                case GatewayOpCode.HeartbeatACK: {
                    this.#gotACK = true;
                    this.#debug?.("ACK");
                    break;
                }
                default:
                    break;
            }

            return;
        });
    }

    #sendHeartbeatPayload(): void {
        this.#gotACK = false;
        this.#ws.send(`{ "op": 1, "d": ${this.#sequenceNumber}, "s": null, "t": null }`);
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
                    browser: "Lilybird",
                    device: "Lilybird"
                },
                presence: this.#options.presence
            },
            s: null,
            t: null
        };

        this.#debug?.("IDENTIFY");
        this.#ws.send(JSON.stringify(payload));
    }

    #resume(): void {
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

        this.#debug?.("RESUME");
        this.#ws.send(JSON.stringify(payload));
    }

    #startTimer(interval: number): void {
        this.#gotACK = true;
        this.#timer = setInterval(async () => {
            if (!this.#gotACK) {
                this.#debug?.("MISSING_ACK");
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                await setTimeout(500);
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (!this.#gotACK) {
                    this.#debug?.("ZOMBIE");
                    this.#ws.close(1001);
                    return;
                }
            }

            this.#debug?.("HEARTBEAT");
            this.#sendHeartbeatPayload();
        }, interval);
    }

    #clearTimer(): void {
        if (typeof this.#timer === "undefined") return;
        clearInterval(this.#timer);
    }

    async #attemptResume(): Promise<void> {
        this.#debug?.("ATTEMPTING_RESUME");
        this.#isResuming = true;
        await this.connect(`${this.resumeInfo.url}/?v=10&encoding=json`);
    }

    /** Returns time taken in ms */
    public async ping(): Promise<number> {
        return new Promise((res) => {
            this.#ws.addEventListener(
                "pong",
                () => {
                    // eslint-disable-next-line @typescript-eslint/no-use-before-define
                    res(Math.round(performance.now() - start));
                },
                { once: true }
            );

            const start = performance.now();
            this.#ws.ping();
        });
    }

    public updatePresence(presence: UpdatePresenceStructure): void {
        const options: UpdatePresence = {
            op: GatewayOpCode.PresenceUpdate,
            d: presence,
            s: null,
            t: null
        };

        this.#ws.send(JSON.stringify(options));
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
