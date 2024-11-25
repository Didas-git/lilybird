import { createClient, Intents } from "lilybird";
import { makeTransformersObject } from "@lilybird/transformers";

import type { Client } from "lilybird";
import type { MergeTransformers } from "@lilybird/transformers";

const transformers = makeTransformersObject();

await createClient<MergeTransformers<Client, typeof transformers>>({
    token: process.env.TOKEN,
    intents: Intents.GUILDS,
    transformers,
    listeners: {
        setup: (_, payload) => {
            console.log(`Logged in as ${payload.user.username}`);
        }
    }
});
