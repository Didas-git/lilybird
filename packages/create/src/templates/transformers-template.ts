import { defaultTransformers } from "@lilybird/transformers";
import { createClient, Intents } from "lilybird";

await createClient({
    token: process.env.TOKEN,
    intents: [Intents.GUILDS],
    transformers: defaultTransformers,
    listeners: {
        ready(client) {
            console.log(`Logged in as ${client.user.username}`);
        }
    }
});
