import { createClient, Intents } from "lilybird";
import { createHandler } from "@lilybird/handlers";

const listeners = await createHandler({
    dirs: {
        listeners: `${import.meta.dir}/events`
    }
});

await createClient({
    token: process.env.TOKEN,
    intents: [Intents.GUILDS],
    attachDebugListener: true,
    ...listeners
});
