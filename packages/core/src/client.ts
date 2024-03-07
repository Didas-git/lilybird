import { REST } from "./http/rest.js";
import { GatewayEvent, InteractionCollectorType, TransformerReturnType } from "#enums";
import { WebSocketManager } from "#ws";
import type { DebugFunction, DispatchFunction } from "#ws";
import type {
    UnavailableGuildStructure,
    CollectorMatchedCallback,
    UpdatePresenceStructure,
    ApplicationStructure,
    InteractionStructure,
    BaseClientOptions,
    CollectorMatcher,
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
export class Client<T extends Transformers = Transformers> {
    public readonly rest: REST = new REST();

    readonly #ws: WebSocketManager;
    readonly #collectors = new Map<CollectorMatcher<T>, { cb: CollectorMatchedCallback<T>, timer: Timer }>();

    #cachedCollectors: Array<[CollectorMatcher<T>, { cb: CollectorMatchedCallback<T>, timer: Timer }]> = [];

    protected readonly ready: boolean = false;

    public constructor(options: BaseClientOptions<T>, debug?: DebugFunction) {
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

    //? Perhaps this should be turned into its own manager...
    public async getCollector(interaction: InteractionStructure): Promise<boolean> {
        for (let i = 0, { length } = this.#cachedCollectors; i < length; i++) {
            const [matcher, { cb, timer } ] = this.#cachedCollectors[i];
            if (!matcher(<never>interaction)) continue;

            clearTimeout(timer);
            // eslint-disable-next-line no-await-in-loop
            await cb(<never>interaction);
            this.#collectors.delete(matcher);
            this.#cachedCollectors = [...this.#collectors.entries()];

            return true;
        }

        return false;
    }

    public addCollector<C extends Transformers = T>(
        matcher: CollectorMatcher<C>,
        callback: CollectorMatchedCallback<C>,
        time: number = 30000
    ): void {
        this.#collectors.set(<never>matcher, { cb: <never>callback, timer: setTimeout(() => { this.#collectors.delete(<never>matcher); }, time) });
        this.#cachedCollectors = [...this.#collectors.entries()];
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
        const builder: Array<string> = [];
        const functions: [names: Array<string>, handlers: Array<(...args: any) => any>] = [[], []];

        const { listeners } = options;
        const transformers = (options.transformers ?? {}) as Record<string, Transformer<any>>;

        if (typeof listeners.raw !== "undefined") {
            functions[0].push("raw");
            functions[1].push(listeners.raw);
            builder.push("await raw(data)");
        }

        builder.push(
            "if(data.t === \"READY\"){",
            "Object.assign(client,{user:"
        );

        if (typeof transformers.userUpdate !== "undefined") {
            functions[0].push("user");
            functions[1].push(transformers.userUpdate.handler);
            builder.push("await user(client, data.d.user)");
        } else builder.push("data.d.user");

        builder.push(
            ",guilds:data.d.guilds,sessionId:data.d.session_id,application:data.d.application});",
            "client.__updateResumeInfo(data.d.resume_gateway_url, data.d.session_id)",
            "if(client.ready)return;client.ready=true;"
        );

        if (typeof listeners.ready !== "undefined") {
            functions[0].push("ready");
            functions[1].push(listeners.ready);
            builder.push("await ready(client, data.d)");
        }

        builder.push("}");

        for (let i = 0, f = 0, listenerEntries = Object.entries(listeners), { length } = listenerEntries; i < length; i++) {
            const [name, handler] = listenerEntries[i] as [string, () => unknown];
            if (name === "raw" || name === "ready") continue;
            if (typeof handler === "undefined") continue;

            const event = name.replace(/[A-Z]/, "_$&").toUpperCase() as GatewayEvent;
            const func = `f${f}`;
            f++;

            functions[0].push(func);
            functions[1].push(handler);
            builder.push(`else if(data.t === "${event}"){`);

            const transformer = transformers[name];

            if (typeof options.collectors?.interactions !== "undefined" && event === GatewayEvent.IntegrationCreate) {
                switch (options.collectors.interactions) {
                    case InteractionCollectorType.GENERIC: {
                        builder.push("if(await client.getCollector(data.d)) return;");
                        break;
                    }
                    case InteractionCollectorType.TRANSFORMED: {
                        if (typeof transformer === "undefined") throw new Error("There is no transformer defined for interactions that can be used with collectors");
                        const transf = `f${f}`;
                        f++;
                        functions[0].push(transf);
                        functions[1].push(transformer.handler);

                        if (transformer.return === TransformerReturnType.MULTIPLE) throw new Error("Transformers being used for collectors can only return a single value");
                        builder.push(
                            `const cd = ${transf}(client, data.d);`,
                            "if(await client.getCollector(cd)) return;",
                            `${func}(cd)`
                        );
                        continue;
                    }
                }
            }

            if (typeof transformer !== "undefined") {
                const transf = `f${f}`;
                f++;
                functions[0].push(transf);
                functions[1].push(transformer.handler);

                switch (transformer.return) {
                    case TransformerReturnType.SINGLE: {
                        builder.push(`${func}(${transf}(client, data.d))`);
                        break;
                    }
                    case TransformerReturnType.MULTIPLE: {
                        builder.push(`${func}(...${transf}(client, data.d))`);
                        break;
                    }
                }
            } else
                builder.push(`${func}(client, data.d)`);

            builder.push("}");
        }

        const [names, handlers] = functions;
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        return new Function("client", ...names, `return async (data) => { ${builder.join("")} }`)(this, ...handlers) as never;
    }
}

export async function createClient<T extends Transformers>(options: ClientOptions<T>): Promise<Client<T>> {
    return new Promise((res) => {
        // This is a promise executer, it doesn't need to be async
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        new Client(
            {
                intents: Array.isArray(options.intents) ? options.intents.reduce((prev, curr) => prev | curr, 0) : options.intents,
                listeners: options.listeners,
                transformers: options.transformers,
                presence: options.presence,
                collectors: options.collectors,
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
