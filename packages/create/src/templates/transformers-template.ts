import { makeTransformersObject } from "@lilybird/transformers";
import { Intents, Client, ListenerCompiler } from "lilybird";

import type { MergeTransformers } from "@lilybird/transformers";

const transformers = makeTransformersObject<Client>();

const compiler = new ListenerCompiler<Client, MergeTransformers<Client, typeof transformers>>({
    transformClient: true,
    transformers
});

compiler.addListener("ready", (client) => {
    console.log(`Logged in as ${client.user.username}`);
}, true);

const client = new Client({
    intents: Intents.GUILDS
});

await client.login(process.env.TOKEN, compiler.getDispatchFunction(client, client.ws.resumeInfo));
