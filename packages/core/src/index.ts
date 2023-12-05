import { Client } from "./client";

import type { ClientOptions } from "./typings";

export type * from "./typings";

export * from "./factories";
export * from "./enums";
export * from "./utils";

export * from "./client";

export async function createClient(options: ClientOptions): Promise<Client> {
    return new Promise((res) => {
        // This is a promise executer, it doesn't need to be async
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        new Client(
            res,
            { intents: options.intents, listeners: options.listeners, setup: options.setup },
            options.attachDebugListener
                ? options.debugListener ?? ((identifier, payload) => {
                    if (identifier === "Received:") return;
                    console.log(identifier, payload ?? "");
                })
                : undefined
        ).login(options.token);
    });
}
