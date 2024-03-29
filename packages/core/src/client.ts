import { REST } from "./http/rest.js";
import { CachingManager } from "./cache/manager.js";
import { WebSocketManager } from "#ws";

import {
    CachingDelegationType,
    TransformerReturnType,
    CacheExecutionPolicy,
    CacheElementType,
    DebugIdentifier,
    GatewayEvent
} from "#enums";

import type { DispatchFunction } from "#ws";
import type {
    UpdatePresenceStructure,
    CacheManagerStructure,
    ApplicationStructure,
    BaseClientOptions,
    SelectiveCache,
    ClientOptions,
    DebugFunction,
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
        this.cache = typeof options.caching?.manager !== "undefined" ? options.caching.manager : new CachingManager();
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

    /** @internal DO NOT USE OUTSIDE OF INTERNAL CODE */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected __updateResumeInfo(url: string, id: string): void {
        Object.assign(this.#ws.resumeInfo, {
            url,
            id
        });
    }

    #generateListeners(options: BaseClientOptions<T>): DispatchFunction {
        const builder = new Map<string, string>();
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
            if (Object.keys(caching.enabled).length === 0) throw new Error("");

            const defaults: SelectiveCache = {
                create: CacheExecutionPolicy.FIRST,
                update: CacheExecutionPolicy.LAST,
                delete: CacheExecutionPolicy.LAST
            };

            // const enabledUser = caching.enabled.user === true ? defaults : typeof caching.enabled.user === "object" ? caching.enabled.user : undefined;
            const enabledGuild = caching.enabled.guild === true ? defaults : typeof caching.enabled.guild === "object" ? caching.enabled.guild : undefined;
            const enabledChannel = caching.enabled.channel === true ? defaults : typeof caching.enabled.channel === "object" ? caching.enabled.channel : undefined;
            const enabledThreads = caching.enabled.channel === true
                ? defaults
                : typeof caching.enabled.channel === "object"
                    ? caching.enabled.channel.threads === true
                        ? defaults
                        : typeof caching.enabled.channel.threads === "object"
                            ? caching.enabled.channel.threads
                            : undefined
                    : undefined;

            if (typeof enabledGuild?.create !== "undefined") {
                const temp: Array<string> = [];
                if (typeof enabledChannel?.create !== "undefined") {
                    if (caching.applyTransformers) {
                        if (!functions.has("t_channelCreate")) {
                            if (typeof transformers.channelCreate === "undefined") throw Error("Missing 'channelCreate' transformer");
                            functions.set("t_channelCreate", transformers.channelCreate.handler);
                        }
                    }
                    temp.push(
                        "for (let i = 0, {channels} = td, {length} = channels; i < length; i++){",
                        `const channel = ${caching.applyTransformers ? "t_channelCreate(client, channels[i])" : "channels[i]"};`,
                        `await client.cache.set(${CacheElementType.CHANNEL}, channel.id, channel);`,
                        "}"
                    );
                }

                if (typeof enabledThreads?.create !== "undefined") {
                    if (caching.applyTransformers) {
                        if (!functions.has("t_channelCreate")) {
                            if (typeof transformers.channelCreate === "undefined") throw Error("Missing 'channelCreate' transformer");
                            functions.set("t_channelCreate", transformers.channelCreate.handler);
                        }
                    }

                    temp.push(
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

                    temp.push(
                        `for (let i = 0, {${key}} = td, {length} = ${key}; i < length; i++){`,
                        `const voice = ${caching.applyTransformers ? `t_voiceStateUpdate(client, ${key}[i])` : `${key}[i]`};`,
                        `await client.cache.set(${CacheElementType.VOICE_STATE}, \`\${voice.${vUid}}:\${voice.${vCid}}\`, voice);`,
                        "}"
                    );
                }

                temp.push(
                    `await client.cache.set(${CacheElementType.GUILD},`,
                    `${caching.applyTransformers ? "td.id, td" : "data.d.id, {...data.d,channels: undefined,threads:undefined,voice_states:undefined}"}`,
                    ");"
                );

                this.#createListener(
                    builder,
                    functions,
                    GatewayEvent.GuildCreate,
                    "guildCreate",
                    listeners.guildCreate,
                    transformers.guildCreate,
                    { when: enabledGuild.create, content: temp.join("") }
                );
            }
            if (typeof enabledGuild?.update !== "undefined") {
                this.#createListener(
                    builder,
                    functions,
                    GatewayEvent.GuildUpdate,
                    "guildUpdate",
                    listeners.guildUpdate,
                    transformers.guildUpdate,
                    {
                        when: enabledGuild.update,
                        content: `await client.cache.set(${CacheElementType.GUILD}, ${caching.applyTransformers ? "td.id, td" : "data.d.id, data.d"});`
                    }
                );
            }
            if (typeof enabledGuild?.delete !== "undefined") {
                this.#createListener(
                    builder,
                    functions,
                    GatewayEvent.GuildDelete,
                    "guildDelete",
                    listeners.guildDelete,
                    transformers.guildDelete,
                    {
                        when: enabledGuild.delete,
                        content: `await client.cache.delete(${CacheElementType.GUILD}, ${caching.applyTransformers ? "td.id" : "data.d.id"});`
                    }
                );
            }
            if (typeof enabledChannel?.create !== "undefined") {
                this.#createListener(
                    builder,
                    functions,
                    GatewayEvent.ChannelCreate,
                    "channelCreate",
                    listeners.channelCreate,
                    transformers.channelCreate,
                    {
                        when: enabledChannel.create,
                        content: `await client.cache.set(${CacheElementType.CHANNEL}, ${caching.applyTransformers ? "td.id, td" : "data.d.id, data.d"});`
                    }
                );
            }
            if (typeof enabledChannel?.update !== "undefined") {
                this.#createListener(
                    builder,
                    functions,
                    GatewayEvent.ChannelUpdate,
                    "channelUpdate",
                    listeners.channelUpdate,
                    transformers.channelUpdate,
                    {
                        when: enabledChannel.update,
                        content: `await client.cache.set(${CacheElementType.CHANNEL}, ${caching.applyTransformers ? "td.id, td" : "data.d.id, data.d"});`
                    }
                );
            }
            if (typeof enabledChannel?.delete !== "undefined") {
                this.#createListener(
                    builder,
                    functions,
                    GatewayEvent.ChannelDelete,
                    "channelDelete",
                    listeners.channelDelete,
                    transformers.channelDelete,
                    {
                        when: enabledChannel.delete,
                        content: `await client.cache.delete(${CacheElementType.CHANNEL}, ${caching.applyTransformers ? "td.id" : "data.d.id"});`
                    }
                );
            }
            if (typeof enabledThreads?.create !== "undefined") {
                this.#createListener(
                    builder,
                    functions,
                    GatewayEvent.ThreadCreate,
                    "threadCreate",
                    listeners.threadCreate,
                    transformers.threadCreate,
                    {
                        when: enabledThreads.create,
                        content: `await client.cache.set(${CacheElementType.CHANNEL}, ${caching.applyTransformers ? "td.id, td" : "data.d.id, data.d"});`
                    }
                );
            }
            if (typeof enabledThreads?.update !== "undefined") {
                this.#createListener(
                    builder,
                    functions,
                    GatewayEvent.ThreadUpdate,
                    "threadUpdate",
                    listeners.threadUpdate,
                    transformers.threadUpdate,
                    {
                        when: enabledThreads.update,
                        content: `await client.cache.set(${CacheElementType.CHANNEL}, ${caching.applyTransformers ? "td.id, td" : "data.d.id, data.d"});`
                    }
                );
            }
            if (typeof enabledThreads?.delete !== "undefined") {
                this.#createListener(
                    builder,
                    functions,
                    GatewayEvent.ThreadDelete,
                    "threadDelete",
                    listeners.threadDelete,
                    transformers.threadDelete,
                    {
                        when: enabledThreads.delete,
                        content: `await client.cache.delete(${CacheElementType.CHANNEL}, ${caching.applyTransformers ? "td.id" : "data.d.id"});`
                    }
                );
            }
            if (typeof caching.enabled.self !== "undefined") {
                if (caching.applyTransformers) {
                    if (!functions.has("t_userUpdate")) {
                        if (typeof transformers.userUpdate === "undefined") throw new Error("Missing 'userUpdate' transformer");
                        if (transformers.userUpdate.return === TransformerReturnType.MULTIPLE) throw new Error("The transformer for 'userUpdate' should only return 1 value");
                        functions.set("t_userUpdate", transformers.userUpdate.handler);
                    }
                }

                this.#createListener(
                    builder,
                    functions,
                    GatewayEvent.UserUpdate,
                    "userUpdate",
                    listeners.userUpdate,
                    transformers.userUpdate,
                    {
                        when: caching.enabled.self,
                        content: `client.user = ${caching.applyTransformers ? "td" : "data.d"}`
                    }
                );
            }
        }
        //#endregion

        const names = functions.keys();
        const handlers = functions.values();
        const compiledListeners = [...builder.values()].join("");
        this.#debug(DebugIdentifier.CompiledListeners, compiledListeners);
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        return new Function("client", ...names, `return async (data) => { ${compiledListeners} }`)(this, ...handlers) as never;
    }

    #createListener(
        builder: Map<string, string>,
        functions: Map<string, (...args: any) => any>,
        event: GatewayEvent,
        name: string,
        handler: ((...args: any) => any) | undefined,
        transformer: Transformer<any> | undefined,
        extra: { when: CacheExecutionPolicy, content: string } | undefined = undefined
    ): void {
        const temp = [`else if(data.t === "${event}"){`];
        if (typeof handler !== "undefined") functions.set(name, handler);

        if (typeof transformer !== "undefined") {
            const transf = `t_${name}`;
            functions.set(transf, transformer.handler);

            switch (transformer.return) {
                case TransformerReturnType.SINGLE: {
                    if (typeof extra !== "undefined") {
                        if (extra.when === CacheExecutionPolicy.FIRST) {
                            temp.push(
                                `const td = await ${transf}(client, data.d);`,
                                extra.content,
                                typeof handler !== "undefined" ? `await ${name}(td)` : ""
                            );
                        } else {
                            temp.push(
                                `const td = await ${transf}(client, data.d);`,
                                typeof handler !== "undefined" ? `await ${name}(td)` : "",
                                extra.content
                            );
                        }
                    } else if (typeof handler !== "undefined") temp.push(`await ${name}(await ${transf}(client, data.d));`);
                    break;
                }
                case TransformerReturnType.MULTIPLE: {
                    if (typeof extra !== "undefined") {
                        if (extra.when === CacheExecutionPolicy.FIRST) {
                            temp.push(
                                `const td = await ${transf}(client, data.d);`,
                                extra.content,
                                typeof handler !== "undefined" ? `await ${name}(...td);` : ""
                            );
                        } else {
                            temp.push(
                                `const td = await ${transf}(client, data.d);`,
                                typeof handler !== "undefined" ? `await ${name}(...td);` : "",
                                extra.content
                            );
                        }
                    } else if (typeof handler !== "undefined") temp.push(`await ${name}(...(await ${transf}(client, data.d)));`);
                    break;
                }
            }
        } else if (typeof extra !== "undefined") {
            if (extra.when === CacheExecutionPolicy.FIRST)
                temp.push("const td = data.d;", extra.content, typeof handler !== "undefined" ? `await ${name}(client, td);` : "");
            else
                temp.push("const td = data.d;", typeof handler !== "undefined" ? `await ${name}(client, td);` : "", extra.content);
        } else if (typeof handler !== "undefined") temp.push(`await ${name}(client, data.d);`);

        if (temp.length === 1) return;

        // Dead code elimination
        // transformed data sometimes might not be needed and its easier to do it this way
        // than adding more complexity to all the branches that add listeners
        if (temp.length === 4) {
            if (temp[2] === "") {
                // eslint-disable-next-line @typescript-eslint/prefer-destructuring
                temp[2] = temp[3];
                temp.pop();
            } else if (temp[3] === "")
                temp.pop();

            if (!temp[1].startsWith("const td ="))
                throw new Error("There was something wrong internally with the compiler");
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (temp.length === 4 && !temp[3].includes("td")) {
                if (!temp[2].includes("td")) {
                    // eslint-disable-next-line @typescript-eslint/prefer-destructuring
                    temp[1] = temp[2];
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    temp[2] = temp.pop()!;
                }
            //@ts-expect-error We are rechecking because we modify the length inside this case
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            } else if (temp.length === 3 && !temp[2].includes("td"))
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                temp[1] = temp.pop()!;
        }

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
