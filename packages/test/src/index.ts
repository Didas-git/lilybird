import { Intents, Client, ListenerCompiler } from "lilybird";
import { handler } from "./handlers.js";

import type { MergeTransformers } from "@lilybird/transformers";
import type { defaultTransformers } from "./handlers.js";

handler.cachePath = `${import.meta.dir}/lily-cache/handler`;

await handler.scanDir(`${import.meta.dir}/commands`);
await handler.scanDir(`${import.meta.dir}/events`);

const compiler = new ListenerCompiler<Client, MergeTransformers<Client, typeof defaultTransformers>>({})
    .addListener("ready", async (client) => {
        await handler.loadGlobalCommands(client);
    }, true)
    .addListenersFromObject(<never>handler.getListenersObject());

const client = new Client({
    intents: Intents.GUILDS
});

await client.login(process.env.TOKEN, compiler.getDispatchFunction(client, client.ws.resumeInfo));
