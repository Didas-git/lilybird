import { Intents, createClient } from "lilybird";
import { handler } from "./handlers.js";

handler.cachePath = `${import.meta.dir}/lily-cache/handler`;

await handler.scanDir(`${import.meta.dir}/commands-adv`);
await handler.scanDir(`${import.meta.dir}/events-adv`);

await createClient({
    token: process.env.TOKEN,
    intents: [Intents.GUILDS],
    setup: async (client) => {
        await handler.loadGlobalCommands(client);
    },
    listeners: handler.getListenersObject()
});
