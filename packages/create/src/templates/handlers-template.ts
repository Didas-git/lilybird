import { Intents, createClient } from "lilybird";
import { handler } from "@lilybird/handlers";

handler.cachePath = `${import.meta.dir}/lily-cache/handler`;

await handler.scanDir(`${import.meta.dir}/commands`);
await handler.scanDir(`${import.meta.dir}/listeners`);

await createClient({
    token: process.env.TOKEN,
    intents: Intents.GUILDS,
    listeners: {
        // Order is important
        setup: async (client) => {
            await handler.loadGlobalCommands(client);
        },
        ...handler.getListenersObject()
    }
});
