import { REST } from "./http/rest.js";
import { CachingManager } from "./cache/manager.js";
import { CachingDelegationType, TransformerReturnType, GatewayEvent, CacheElementType } from "#enums";
import { WebSocketManager } from "#ws";

import type { DebugFunction, DispatchFunction } from "#ws";

import type {
    UpdatePresenceStructure,
    CacheManagerStructure,
    ApplicationStructure,
    BaseClientOptions,
    ClientOptions,
    Transformers,
    Transformer
} from "./typings/index.js";

type GetUserType<T extends Transformers> = (T["userUpdate"] & {}) extends { handler: ((...args: infer U) => infer R) }
    ? unknown extends R
        ? U[1]
        : R
    : never ;

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface Client<T extends Transformers> {
    readonly user: GetUserType<T>;
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
export class Client<T extends Transformers = Transformers> {
    public readonly rest: REST = new REST();
    public readonly cache: CacheManagerStructure;

    readonly #ws: WebSocketManager;
    readonly #debug: DebugFunction;

    protected readonly ready: boolean = false;

    public constructor(options: BaseClientOptions<T>, debug?: DebugFunction) {
        this.cache = options.caching?.delegate === CachingDelegationType.EXTERNAL ? options.caching.manager : new CachingManager();
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.#debug = debug ?? (() => {});
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

    /** @internal DO NOT USE OUTSIDE OF INTERNAL CODE*/
    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected __updateResumeInfo(url: string, id: string): void {
        Object.assign(this.#ws.resumeInfo, {
            url,
            id
        });
    }

    #generateListeners(options: BaseClientOptions<T>): DispatchFunction {
        const builder = new Map<string, string>();
        // const functions: [names: Set<string>, handlers: Array<(...args: any) => any>] = [new Set(), []];
        const functions = new Map<string, (...args: any) => any>();

        const { listeners, caching } = options;
        const transformers = (options.transformers ?? {}) as Record<string, Transformer<any>>;

        //#region Raw Listener
        if (typeof listeners.raw !== "undefined") {
            functions.set("raw", listeners.raw);
            builder.set("RAW", "await raw(data);");
        }
        //#endregion
        //#region Ready Listener
        const readyArr = [];
        readyArr.push(
            "if(data.t === \"READY\"){",
            "Object.assign(client,{user:"
        );

        if (typeof transformers.userUpdate !== "undefined") {
            if (transformers.userUpdate.return === TransformerReturnType.MULTIPLE) throw new Error("The transformer for 'userUpdate' should only return 1 value");
            functions.set("t_userUpdate", transformers.userUpdate.handler);
            readyArr.push("await t_userUpdate(client, data.d.user)");
        } else readyArr.push("data.d.user");

        readyArr.push(
            ",sessionId:data.d.session_id,application:data.d.application});",
            "client.__updateResumeInfo(data.d.resume_gateway_url, data.d.session_id);",
            "if(client.ready)return;client.ready=true;"
        );

        if (typeof options.setup !== "undefined") {
            functions.set("setup", options.setup);
            readyArr.push("await setup(client);");
        }

        if (typeof listeners.ready !== "undefined") {
            functions.set("ready", listeners.ready);

            const transformer = transformers.ready;

            if (typeof transformer !== "undefined") {
                functions.set("t_ready", transformer.handler);
                switch (transformer.return) {
                    case TransformerReturnType.SINGLE: {
                        readyArr.push("await ready(t_ready(client, data.d));");
                        break;
                    }
                    case TransformerReturnType.MULTIPLE: {
                        readyArr.push("await ready(...t_ready(client, data.d));");
                        break;
                    }
                }
            } else readyArr.push("await ready(client, data.d);");
        }

        readyArr.push("}");
        builder.set("READY", readyArr.join(""));
        //#endregion
        //#region User defined listeners
        for (let i = 0, listenerEntries = Object.entries(listeners), { length } = listenerEntries; i < length; i++) {
            const [name, handler] = listenerEntries[i] as [string, () => unknown];
            if (name === "raw" || name === "ready") continue;
            if (typeof handler === "undefined") continue;

            const event = name.replace(/[A-Z]/, "_$&").toUpperCase() as GatewayEvent;
            const transformer = transformers[name];

            this.#createListener(
                builder,
                functions,
                event,
                name,
                handler,
                transformer
            );
        }
        //#endregion
        //#region Cache handlers
        if (typeof caching !== "undefined" && caching.delegate !== CachingDelegationType.TRANSFORMERS) {
            if (caching.delegate === CachingDelegationType.EXTERNAL) throw new Error("External caching is not yet supported");
            for (let i = 0, entries = Object.entries(caching.enabled), { length } = entries; i < length; i++) {
                const [type, enabled] = entries[i];
                if (enabled === false || typeof enabled === "undefined") continue;

                switch (type) {
                    case "user": {
                        console.error("User cache is not implemented yet");
                        break;
                    }
                    case "guild": {
                        if (enabled === true || enabled.create) {
                            const gcb: Array<string> = [];
                            // Go figure why the rules are colliding like this
                            // eslint-disable-next-line @stylistic/no-extra-parens
                            if (caching.enabled.channel === true || (typeof caching.enabled.channel === "object" && caching.enabled.channel.create)) {
                                if (caching.applyTransformers) {
                                    if (!functions.has("t_channelCreate")) {
                                        if (typeof transformers.channelCreate === "undefined") throw Error("Missing 'channelCreate' transformer");
                                        functions.set("t_channelCreate", transformers.channelCreate.handler);
                                    }
                                }
                                gcb.push(
                                    "for (let i = 0, {channels} = td, {length} = channels; i < length; i++){",
                                    `const channel = ${caching.applyTransformers ? "t_channelCreate(client, channels[i])" : "channels[i]"};`,
                                    `await client.cache.set(${CacheElementType.CHANNEL}, channel.id, channel);`,
                                    "}",
                                    "for (let i = 0, {threads} = td, {length} = threads; i < length; i++){",
                                    `const channel = ${caching.applyTransformers ? "t_channelCreate(client, threads[i])" : "threads[i]"};`,
                                    `await client.cache.set(${CacheElementType.CHANNEL}, channel.id, channel);`,
                                    "}"
                                );
                            }

                            if (caching.enabled.voiceState) {
                                if (caching.applyTransformers) {
                                    if (!functions.has("t_voiceStateUpdate")) {
                                        if (typeof transformers.voiceStateUpdate === "undefined") throw Error("Missing 'voiceStateUpdate' transformer");
                                        functions.set("t_voiceStateUpdate", transformers.voiceStateUpdate.handler);
                                    }
                                }
                                const key = caching.customKeys?.guild_voice_states ?? "voice_states";
                                const vCid = caching.customKeys?.voice_state_channel_id ?? "channel_id";
                                const vUid = caching.customKeys?.voice_state_user_id ?? "user_id";
                                gcb.push(
                                    `for (let i = 0, {${key}} = td, {length} = ${key}; i < length; i++){`,
                                    `const voice = ${caching.applyTransformers ? `t_voiceStateUpdate(client, ${key}[i])` : `${key}[i]`};`,
                                    `await client.cache.set(${CacheElementType.VOICE_STATE}, \`\${voice.${vUid}}:\${voice.${vCid}}\`, voice);`,
                                    "}"
                                );
                            }

                            gcb.push(
                                `await client.cache.set(${CacheElementType.GUILD},`,
                                `${caching.applyTransformers ? "td.id, td" : "data.d.id, {...data.d,channels: undefined,threads:undefined,voice_states:undefined}"}`,
                                ");"
                            );

                            this.#createListener(
                                builder,
                                functions,
                                GatewayEvent.GuildCreate,
                                "guildCreate",
                                // eslint-disable-next-line @typescript-eslint/no-empty-function
                                listeners.guildCreate ?? (() => {}),
                                transformers.guildCreate,
                                gcb.join("")
                            );
                        }
                        if (enabled === true || enabled.update) {
                            this.#createListener(
                                builder,
                                functions,
                                GatewayEvent.GuildUpdate,
                                "guildUpdate",
                                // eslint-disable-next-line @typescript-eslint/no-empty-function
                                listeners.guildUpdate ?? (() => {}),
                                transformers.guildUpdate,
                                `await client.cache.set(${CacheElementType.GUILD}, ${caching.applyTransformers ? "td.id, td" : "data.d.id, data.d"});`
                            );
                        }
                        if (enabled === true || enabled.delete) {
                            this.#createListener(
                                builder,
                                functions,
                                GatewayEvent.GuildDelete,
                                "guildDelete",
                                // eslint-disable-next-line @typescript-eslint/no-empty-function
                                listeners.guildDelete ?? (() => {}),
                                transformers.guildDelete,
                                `await client.cache.delete(${CacheElementType.GUILD}, ${caching.applyTransformers ? "td.id" : "data.d.id"});`
                            );
                        }
                        break;
                    }
                    case "channel": {
                        if (enabled === true || enabled.create) {
                            this.#createListener(
                                builder,
                                functions,
                                GatewayEvent.ChannelCreate,
                                "channelCreate",
                                // eslint-disable-next-line @typescript-eslint/no-empty-function
                                listeners.channelCreate ?? (() => {}),
                                transformers.channelCreate,
                                `await client.cache.set(${CacheElementType.CHANNEL}, ${caching.applyTransformers ? "td.id, td" : "data.d.id, data.d"})`
                            );
                        }
                        if (enabled === true || enabled.update) {
                            this.#createListener(
                                builder,
                                functions,
                                GatewayEvent.ChannelUpdate,
                                "channelUpdate",
                                // eslint-disable-next-line @typescript-eslint/no-empty-function
                                listeners.channelUpdate ?? (() => {}),
                                transformers.channelUpdate,
                                `await client.cache.set(${CacheElementType.CHANNEL}, ${caching.applyTransformers ? "td.id, td" : "data.d.id, data.d"})`
                            );
                        }
                        if (enabled === true || enabled.delete) {
                            this.#createListener(
                                builder,
                                functions,
                                GatewayEvent.ChannelDelete,
                                "channelDelete",
                                // eslint-disable-next-line @typescript-eslint/no-empty-function
                                listeners.channelDelete ?? (() => {}),
                                transformers.channelDelete,
                                `await client.cache.delete(${CacheElementType.CHANNEL}, ${caching.applyTransformers ? "td.id" : "data.d.id"})`
                            );
                        }
                        // Go figure why the rules are colliding like this
                        // eslint-disable-next-line @stylistic/no-extra-parens
                        if (enabled === true || ("threads" in enabled && typeof enabled.threads !== "undefined" && (enabled.threads === true || typeof enabled.threads === "object"))) {
                            if (enabled === true || enabled.threads === true || (<Exclude<typeof enabled.threads, false | undefined>>enabled.threads).create) {
                                this.#createListener(
                                    builder,
                                    functions,
                                    GatewayEvent.ThreadCreate,
                                    "threadCreate",
                                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                                    listeners.threadCreate ?? (() => {}),
                                    transformers.threadCreate,
                                    `await client.cache.set(${CacheElementType.CHANNEL}, ${caching.applyTransformers ? "td.id, td" : "data.d.id, data.d"})`
                                );
                            }
                            if (enabled === true || enabled.threads === true || (<Exclude<typeof enabled.threads, false | undefined>>enabled.threads).update) {
                                this.#createListener(
                                    builder,
                                    functions,
                                    GatewayEvent.ThreadUpdate,
                                    "threadUpdate",
                                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                                    listeners.threadUpdate ?? (() => {}),
                                    transformers.threadUpdate,
                                    `await client.cache.set(${CacheElementType.CHANNEL}, ${caching.applyTransformers ? "td.id, td" : "data.d.id, data.d"})`
                                );
                            }
                            if (enabled === true || enabled.threads === true || (<Exclude<typeof enabled.threads, false | undefined>>enabled.threads).delete) {
                                this.#createListener(
                                    builder,
                                    functions,
                                    GatewayEvent.ThreadDelete,
                                    "threadDelete",
                                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                                    listeners.threadDelete ?? (() => {}),
                                    transformers.threadDelete,
                                    `await client.cache.delete(${CacheElementType.CHANNEL}, ${caching.applyTransformers ? "td.id" : "data.d.id"})`
                                );
                            }
                        }
                        break;
                    }
                    case "voiceState": {
                        console.error("VoiceState cache is not fully implemented yet");
                        break;
                    }
                    default: break;
                }
            }
        }
        //#endregion

        const names = functions.keys();
        const handlers = functions.values();
        const compiledListeners = [...builder.values()].join("");
        this.#debug("LISTENERS", compiledListeners);
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        return new Function("client", ...names, `return async (data) => { ${compiledListeners} }`)(this, ...handlers) as never;
    }

    #createListener(
        builder: Map<string, string>,
        functions: Map<string, (...args: any) => any>,
        event: GatewayEvent,
        name: string,
        handler: (...args: any) => any,
        transformer: Transformer<any> | undefined,
        extra: string | undefined = undefined
    ): void {
        const temp = [];
        functions.set(name, handler);
        temp.push(`else if(data.t === "${event}"){`);

        if (typeof transformer !== "undefined") {
            const transf = `t_${name}`;
            functions.set(transf, transformer.handler);

            switch (transformer.return) {
                case TransformerReturnType.SINGLE: {
                    if (typeof extra !== "undefined") {
                        temp.push(
                            `const td = await ${transf}(client, data.d);`,
                            extra,
                            `await ${name}(td)`
                        );
                    } else temp.push(`await ${name}(await ${transf}(client, data.d));`);
                    break;
                }
                case TransformerReturnType.MULTIPLE: {
                    if (typeof extra !== "undefined") {
                        temp.push(
                            `const td = await ${transf}(client, data.d);`,
                            extra,
                            `await ${name}(...td);`
                        );
                    } else temp.push(`await ${name}(...(await ${transf}(client, data.d)));`);
                    break;
                }
            }
        } else if (typeof extra !== "undefined") temp.push("const td = data.d;", extra, `await ${name}(client, td);`);
        else temp.push(`await ${name}(client, data.d);`);

        temp.push("}");

        builder.set(event, temp.join(""));
    }
}

export async function createClient<T extends Transformers>(options: ClientOptions<T>): Promise<Client<T>> {
    if (typeof options.caching?.customKeys !== "undefined") options.caching.customKeys = { ...options.customCacheKeys, ...options.caching.customKeys };
    else if (typeof options.caching !== "undefined") options.caching.customKeys = options.customCacheKeys;

    return new Promise((res) => {
        // This is a promise executer, it doesn't need to be async
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        new Client(
            {
                intents: Array.isArray(options.intents) ? options.intents.reduce((prev, curr) => prev | curr, 0) : options.intents,
                listeners: options.listeners,
                transformers: options.transformers,
                presence: options.presence,
                caching: options.caching,
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
