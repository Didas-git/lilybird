import { createClient, Intents } from "lilybird";

await createClient({
    token: process.env.TOKEN,
    intents: Intents.GUILDS,
    listeners: {
        setup: (_, payload) => {
            console.log(`Logged in as ${payload.user.username}`);
        }
    }
});
