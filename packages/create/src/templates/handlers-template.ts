import { createHandler } from "@lilybird/handlers";
import { Intents, createClient } from "lilybird";

const listeners = await createHandler({
    dirs: {
        listeners: `${import.meta.dir}/listeners`
    }
});

await createClient({
    token: process.env.TOKEN,
    intents: [Intents.GUILDS],
    ...listeners
});
