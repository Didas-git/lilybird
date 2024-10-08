import { Intents, createClient } from "lilybird";
import { handler } from "@lilybird/handlers/advanced";

handler.cachePath = `${import.meta.dir}/lily-cache/handler`;

await handler.scanDir(`${import.meta.dir}/commands`);
await handler.scanDir(`${import.meta.dir}/listeners`);

await createClient({
    token: process.env.TOKEN,
    intents: [Intents.GUILDS],
    setup: async (client) => {
        await handler.loadGlobalCommands(client);
    },
    listeners: handler.getListenersObject()
});
