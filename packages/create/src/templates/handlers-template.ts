import type { Transformers } from "lilybird";
import { Intents, Client, ListenerCompiler } from "lilybird";
import { handler } from "@lilybird/handlers";

handler.cachePath = `${import.meta.dir}/lily-cache/handler`;

await handler.scanDir(`${import.meta.dir}/commands`);
await handler.scanDir(`${import.meta.dir}/listeners`);

const compiler = new ListenerCompiler<Client, Transformers<Client>>({})
    .addListener("ready", async (client) => {
        await handler.loadGlobalCommands(client);
    }, true)
    .addListenersFromObject(<never>handler.getListenersObject());

const client = new Client({
    intents: Intents.GUILDS
});

await client.login(process.env.TOKEN, compiler.getDispatchFunction(client, client.ws.resumeInfo));
