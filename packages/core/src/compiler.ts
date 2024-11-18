import {
    CachingDelegationType,
    TransformerReturnType,
    CacheExecutionPolicy,
    CacheElementType,
    GatewayEvent
} from "#enums";

import type { DispatchFunction } from "#ws";
import type {
    ReceiveDispatchEvent,
    SelectiveCache,
    CachingOptions,
    Transformers,
    Transformer,
    MockClient,
    Awaitable,
    Listeners,
    Ready
} from "./typings/index.js";

export class ListenerCompiler<C extends MockClient, T extends Transformers<C>> {
    readonly #stack: Map<string, string>;
    readonly #callbacks: Map<string, (...args: any) => any>;

    readonly #transformers: T;
    readonly #shouldTransformClientUser: boolean;

    public constructor(options: { transformers?: T, transformClient?: boolean }) {
        this.#stack = new Map();
        this.#callbacks = new Map();
        this.#transformers = options.transformers ?? <T>{};
        this.#shouldTransformClientUser = options.transformClient ?? false;

        // We want to guarantee the raw listener will always be the first thing on the stack even if its not included
        this.#stack.set("raw", "");
        this.#stack.set("ready", "");
    }

    #createListener(
        event: GatewayEvent,
        name: string,
        extra: { when: CacheExecutionPolicy, content: string } | undefined = undefined
    ): void {
        const handler = this.#callbacks.get(name);
        const transformer: Transformer<C, any> = this.#transformers[<never>name];
        const temp = [`else if(payload.t === "${event}"){`];
        const transf = `t_${name}`;

        if (typeof transformer !== "undefined") {
            this.#callbacks.set(transf, transformer.handler);

            switch (transformer.return) {
                case TransformerReturnType.SINGLE: {
                    if (typeof extra !== "undefined") {
                        if (extra.when === CacheExecutionPolicy.FIRST) {
                            temp.push(
                                `const td = await ${transf}(client_ptr, payload.d);`,
                                extra.content,
                                typeof handler !== "undefined" ? `await ${name}(td)` : ""
                            );
                        } else {
                            temp.push(
                                `const td = await ${transf}(client_ptr, payload.d);`,
                                typeof handler !== "undefined" ? `await ${name}(td)` : "",
                                extra.content
                            );
                        }
                    } else if (typeof handler !== "undefined") temp.push(`await ${name}(await ${transf}(client_ptr, payload.d));`);
                    break;
                }
                case TransformerReturnType.MULTIPLE: {
                    if (typeof extra !== "undefined") {
                        if (extra.when === CacheExecutionPolicy.FIRST) {
                            temp.push(
                                `const td = await ${transf}(client_ptr, payload.d);`,
                                extra.content,
                                typeof handler !== "undefined" ? `await ${name}(...td);` : ""
                            );
                        } else {
                            temp.push(
                                `const td = await ${transf}(client_ptr, payload.d);`,
                                typeof handler !== "undefined" ? `await ${name}(...td);` : "",
                                extra.content
                            );
                        }
                    } else if (typeof handler !== "undefined") temp.push(`await ${name}(...(await ${transf}(client_ptr, payload.d)));`);
                    break;
                }
            }
        } else if (typeof extra !== "undefined") {
            if (extra.when === CacheExecutionPolicy.FIRST)
                temp.push("const td = payload.d;", extra.content, typeof handler !== "undefined" ? `await ${name}(client_ptr, td);` : "");
            else
                temp.push("const td = payload.d;", typeof handler !== "undefined" ? `await ${name}(client_ptr, td);` : "", extra.content);
        } else if (typeof handler !== "undefined") temp.push(`await ${name}(client_ptr, payload.d);`);

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
                    this.#callbacks.delete(transf);
                }
            //@ts-expect-error We are rechecking because we modify the length inside this case
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            } else if (temp.length === 3 && !temp[2].includes("td")) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                temp[1] = temp.pop()!;
                this.#callbacks.delete(transf);
            }
        }

        temp.push("}");

        this.#stack.set(event, temp.join(""));
    }

    //! TODO: Support a once listener and always listener simultaneously
    #addReadyListener(once: boolean = false, listener?: (client: C, payload: Ready["d"]) => Awaitable<any>): void {
        const readyArr = [];
        readyArr.push(
            "if(payload.t === \"READY\"){",
            "Object.assign(client_ptr,{user:"
        );

        if (this.#shouldTransformClientUser && typeof this.#transformers.userUpdate !== "undefined") {
            if (this.#transformers.userUpdate.return === TransformerReturnType.MULTIPLE) throw new Error("The transformer for 'userUpdate' should only return 1 value");
            this.#callbacks.set("t_userUpdate", this.#transformers.userUpdate.handler);
            readyArr.push("await t_userUpdate(client, payload.d.user)");
        } else readyArr.push("payload.d.user");

        readyArr.push(
            `,sessionId:payload.d.session_id,application:payload.d.application,ready:${once ? "false" : "true"}});`,
            "Object.assign(resume_info_ptr{url:payload.d.resume_gateway_url,id:payload.d.session_id});"
        );

        if (typeof listener !== "undefined") {
            if (once) readyArr.push("if(!client_ptr.ready){client_ptr.ready=true;");
            this.#callbacks.set("ready", listener);

            if (typeof this.#transformers.ready !== "undefined") {
                this.#callbacks.set("t_ready", this.#transformers.ready.handler);
                switch (this.#transformers.ready.return) {
                    case TransformerReturnType.SINGLE: {
                        readyArr.push("await ready(t_ready(client_ptr, payload.d));");
                        break;
                    }
                    case TransformerReturnType.MULTIPLE: {
                        readyArr.push("await ready(...t_ready(client_ptr, payload.d));");
                        break;
                    }
                }
            } else readyArr.push("await ready(client_ptr, payload.d);");
            if (once) readyArr.push("}");
        }

        readyArr.push("}");
        this.#stack.set("ready", readyArr.join(""));
    }

    public appendCachingHandlers(options: CachingOptions): this {
        if (typeof options !== "undefined" && options.delegate !== CachingDelegationType.TRANSFORMERS) {
            if (options.delegate === CachingDelegationType.EXTERNAL && options.applyTransformers === true && !options.safeToTransform) {
                process.emitWarning("Transformers will be applied to external solution!", {
                    code: "EXTERNAL_TRANSFORMERS",
                    detail: "Some external caching managers might not support transformers, please read their documentation before proceeding."
                });
            }

            if (Object.keys(options.enabled).length === 0) throw new Error("Got unexpected empty object");

            const defaults: SelectiveCache = {
                create: CacheExecutionPolicy.FIRST,
                update: CacheExecutionPolicy.LAST,
                delete: CacheExecutionPolicy.LAST
            };

            // const enabledUser = caching.enabled.user === true ? defaults : typeof caching.enabled.user === "object" ? caching.enabled.user : undefined;
            const enabledGuild = options.enabled.guild === true ? defaults : typeof options.enabled.guild === "object" ? options.enabled.guild : undefined;
            const enabledChannel = options.enabled.channel === true ? defaults : typeof options.enabled.channel === "object" ? options.enabled.channel : undefined;
            const enabledThreads = options.enabled.channel === true
                ? defaults
                : typeof options.enabled.channel === "object"
                    ? options.enabled.channel.threads === true
                        ? defaults
                        : typeof options.enabled.channel.threads === "object"
                            ? options.enabled.channel.threads
                            : undefined
                    : undefined;

            if (typeof options.enabled.voiceState !== "undefined" && typeof enabledGuild?.create === "undefined") throw new Error("The 'voiceState' cache needs the `guildCreate' cache to be enabled");

            if (typeof enabledGuild?.create !== "undefined") {
                const temp: Array<string> = [];
                if (typeof enabledChannel?.create !== "undefined") {
                    if (options.applyTransformers) {
                        if (!this.#callbacks.has("t_channelCreate")) {
                            if (typeof this.#transformers.channelCreate === "undefined") throw Error("Missing 'channelCreate' transformer");
                            this.#callbacks.set("t_channelCreate", this.#transformers.channelCreate.handler);
                        }
                    }
                    temp.push(
                        "for (let i = 0, {channels} = td, {length} = channels; i < length; i++){",
                        `const channel = ${options.applyTransformers ? "t_channelCreate(client_ptr, channels[i])" : "channels[i]"};`,
                        `await client_ptr.cache.set(${CacheElementType.CHANNEL}, channel.id, channel);`,
                        "}"
                    );
                }

                if (typeof enabledThreads?.create !== "undefined") {
                    if (options.applyTransformers) {
                        if (!this.#callbacks.has("t_channelCreate")) {
                            if (typeof this.#transformers.channelCreate === "undefined") throw Error("Missing 'channelCreate' transformer");
                            this.#callbacks.set("t_channelCreate", this.#transformers.channelCreate.handler);
                        }
                    }

                    temp.push(
                        "for (let i = 0, {threads} = td, {length} = threads; i < length; i++){",
                        `const channel = ${options.applyTransformers ? "t_channelCreate(client_ptr, threads[i])" : "threads[i]"};`,
                        `await client_ptr.cache.set(${CacheElementType.CHANNEL}, channel.id, channel);`,
                        "}"
                    );
                }

                if (typeof options.enabled.voiceState !== "undefined") {
                    if (options.applyTransformers) {
                        if (!this.#callbacks.has("t_voiceStateUpdate")) {
                            if (typeof this.#transformers.voiceStateUpdate === "undefined") throw Error("Missing 'voiceStateUpdate' transformer");
                            this.#callbacks.set("t_voiceStateUpdate", this.#transformers.voiceStateUpdate.handler);
                        }
                    }
                    const key = options.customKeys?.guild_voice_states ?? "voice_states";
                    const vCid = options.customKeys?.voice_state_channel_id ?? "channel_id";
                    const vUid = options.customKeys?.voice_state_user_id ?? "user_id";

                    this.#createListener(
                        GatewayEvent.VoiceStateUpdate,
                        "voiceStateUpdate",
                        {
                            when: options.enabled.voiceState,
                            content: `await client_ptr.cache.set(${CacheElementType.VOICE_STATE}, ${options.applyTransformers
                                ? `\`\${td.${vUid}}:\${td.${vCid}}\``
                                : `\`\${payload.d.${vUid}}:\${payload.d.${vCid}}\``}, payload.d);`
                        }
                    );

                    temp.push(
                        `for (let i = 0, {${key}} = td, {length} = ${key}; i < length; i++){`,
                        `const voice = ${options.applyTransformers ? `t_voiceStateUpdate(client_ptr, ${key}[i])` : `${key}[i]`};`,
                        `await client_ptr.cache.set(${CacheElementType.VOICE_STATE}, \`\${voice.${vUid}}:\${voice.${vCid}}\`, voice);`,
                        "}"
                    );
                }

                temp.push(
                    `await client_ptr.cache.set(${CacheElementType.GUILD},`,
                    options.applyTransformers ? "td.id, td" : "payload.d.id, {...payload.d,channels: undefined,threads:undefined,voice_states:undefined}",
                    ");"
                );

                this.#createListener(
                    GatewayEvent.GuildCreate,
                    "guildCreate",
                    { when: enabledGuild.create, content: temp.join("") }
                );
            }
            if (typeof enabledGuild?.update !== "undefined") {
                this.#createListener(
                    GatewayEvent.GuildUpdate,
                    "guildUpdate",
                    {
                        when: enabledGuild.update,
                        content: `await client_ptr.cache.set(${CacheElementType.GUILD}, ${options.applyTransformers ? "td.id, td" : "payload.d.id, payload.d"});`
                    }
                );
            }
            if (typeof enabledGuild?.delete !== "undefined") {
                this.#createListener(
                    GatewayEvent.GuildDelete,
                    "guildDelete",
                    {
                        when: enabledGuild.delete,
                        content: `await client_ptr.cache.delete(${CacheElementType.GUILD}, ${options.applyTransformers ? "td.id" : "payload.d.id"});`
                    }
                );
            }
            if (typeof enabledChannel?.create !== "undefined") {
                this.#createListener(
                    GatewayEvent.ChannelCreate,
                    "channelCreate",
                    {
                        when: enabledChannel.create,
                        content: `await client_ptr.cache.set(${CacheElementType.CHANNEL}, ${options.applyTransformers ? "td.id, td" : "payload.d.id, payload.d"});`
                    }
                );
            }
            if (typeof enabledChannel?.update !== "undefined") {
                this.#createListener(
                    GatewayEvent.ChannelUpdate,
                    "channelUpdate",
                    {
                        when: enabledChannel.update,
                        content: `await client_ptr.cache.set(${CacheElementType.CHANNEL}, ${options.applyTransformers ? "td.id, td" : "payload.d.id, payload.d"});`
                    }
                );
            }
            if (typeof enabledChannel?.delete !== "undefined") {
                this.#createListener(
                    GatewayEvent.ChannelDelete,
                    "channelDelete",
                    {
                        when: enabledChannel.delete,
                        content: `await client_ptr.cache.delete(${CacheElementType.CHANNEL}, ${options.applyTransformers ? "td.id" : "payload.d.id"});`
                    }
                );
            }
            if (typeof enabledThreads?.create !== "undefined") {
                this.#createListener(
                    GatewayEvent.ThreadCreate,
                    "threadCreate",
                    {
                        when: enabledThreads.create,
                        content: `await client_ptr.cache.set(${CacheElementType.CHANNEL}, ${options.applyTransformers ? "td.id, td" : "payload.d.id, payload.d"});`
                    }
                );
            }
            if (typeof enabledThreads?.update !== "undefined") {
                this.#createListener(
                    GatewayEvent.ThreadUpdate,
                    "threadUpdate",
                    {
                        when: enabledThreads.update,
                        content: `await client_ptr.cache.set(${CacheElementType.CHANNEL}, ${options.applyTransformers ? "td.id, td" : "payload.d.id, payload.d"});`
                    }
                );
            }
            if (typeof enabledThreads?.delete !== "undefined") {
                this.#createListener(
                    GatewayEvent.ThreadDelete,
                    "threadDelete",
                    {
                        when: enabledThreads.delete,
                        content: `await client_ptr.cache.delete(${CacheElementType.CHANNEL}, ${options.applyTransformers ? "td.id" : "payload.d.id"});`
                    }
                );
            }
            if (typeof options.enabled.self !== "undefined") {
                if (options.applyTransformers) {
                    if (!this.#callbacks.has("t_userUpdate")) {
                        if (typeof this.#transformers.userUpdate === "undefined") throw new Error("Missing 'userUpdate' transformer");
                        if (this.#transformers.userUpdate.return === TransformerReturnType.MULTIPLE) throw new Error("The transformer for 'userUpdate' should only return 1 value");
                        this.#callbacks.set("t_userUpdate", this.#transformers.userUpdate.handler);
                    }
                }

                this.#createListener(
                    GatewayEvent.UserUpdate,
                    "userUpdate",
                    {
                        when: options.enabled.self,
                        content: `client_ptr.user = ${options.applyTransformers ? "td" : "payload.d"}`
                    }
                );
            }
        }

        return this;
    }

    //? Raw listener should probably be completely removed now that dispatch is exposed
    public addRawListener(listener: (payload: ReceiveDispatchEvent) => Awaitable<any>): this {
        this.#stack.set("raw", "await raw(payload)");
        this.#callbacks.set("raw", listener);
        return this;
    }

    /**
     * @param name - The name of the event you are listening to
     * @param handler - The handler that will be executed when the event is received
     * @param once - Wether the `ready` listener should only be called once
     * @returns
     */
    public addListener<L extends Listeners<C, T> = Listeners<C, T>, K extends (keyof L) & string = (keyof L) & string>(
        name: K,
        handler: L[K] & {},
        once: boolean = false
    ): this {
        if (name === "raw") {
            this.addRawListener(<never>handler);
            return this;
        }

        if (name === "ready") {
            this.#addReadyListener(once, <never>handler);
            return this;
        }

        const parsedName = `${name[0].toUpperCase()}${name.slice(1)}`;
        const event: GatewayEvent = GatewayEvent[<never>parsedName];

        this.#callbacks.set(name, handler);

        this.#createListener(
            event,
            name
        );

        return this;
    }

    public getCompilationOutput(): {
        handlers: {
            names: Array<string>,
            callbacks: Array<(...args: any) => any>
        },
        stack: string
    } {
        const hasReadyListener = !(this.#stack.get("ready") === "");
        if (!hasReadyListener) this.#addReadyListener();

        const names = [...this.#callbacks.keys()];
        const handlers = [...this.#callbacks.values()];
        const compiledListeners = [...this.#stack.values()].join("");

        return {
            handlers: {
                names,
                callbacks: handlers
            },
            stack: compiledListeners
        };
    }

    public clearStack(): void {
        this.#stack.clear();
        this.#callbacks.clear();
        this.#stack.set("raw", "");
        this.#stack.set("ready", "");
    }

    public getDispatchFunction(clientPointer: C, resumeInfoPointer: { url: string, id: string }): DispatchFunction {
        const { handlers, stack } = this.getCompilationOutput();
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        return new Function("client_ptr", "resume_info_ptr", ...handlers.names, `return async (payload) => { ${stack} }`)(clientPointer, resumeInfoPointer, ...handlers.callbacks) as never;
    }

    public addListenersFromObject(listeners: Listeners<C, T>): this {
        for (let i = 0, entries = Object.entries(listeners), { length } = entries; i < length; i++) {
            const [event, handler] = <[string, (...args: any) => any]>entries[i];
            // There is no need for us to strongly type this
            this.addListener(<never>event, <never>handler);
        }

        return this;
    }
}