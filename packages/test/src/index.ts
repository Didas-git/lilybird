import { defaultTransformers, handler } from "./handlers.js";
import { createClient, Intents } from "lilybird";

import "./barrel.js";

import type { Client } from "lilybird";
import type { MergeTransformers } from "@lilybird/transformers";

await createClient<MergeTransformers<Client, typeof defaultTransformers>>({
    token: process.env.TOKEN,
    intents: Intents.GUILDS,
    transformers: defaultTransformers,
    listeners: {
        setup: async (client) => {
            await handler.loadGlobalCommands(client);
        },
        ...handler.getListenersObject()
    }
});
