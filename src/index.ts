import { Client } from "./client";

import type { ClientOptions } from "./typings";

export type * from "./typings";

export * from "./factories";
export * from "./builders";
export * from "./handlers";
export * from "./enums";
export * from "./utils";

export async function createClient(options: ClientOptions): Promise<Client> {
    return new Promise((res) => {
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