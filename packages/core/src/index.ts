import { Client } from "./client.js";

import type { ClientOptions } from "./typings/client.js";

export type * from "./typings/index.js";

export * from "./enums/index.js";

export * from "./client.js";
export * from "./utils.js";

export async function createClient(options: ClientOptions): Promise<Client> {
    return new Promise((res) => {
        // This is a promise executer, it doesn't need to be async
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        new Client(
            res,
            { intents: options.intents, listeners: options.listeners, setup: options.setup },
            options.attachDebugListener
                ? options.debugListener ?? ((identifier, payload) => {
                    console.log(identifier, payload ?? "");
                })
                : undefined
        ).login(options.token);
    });
}
