/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { createClient, Intents } from "lilybird";

await createClient({
    token: process.env.TOKEN,
    intents: [Intents.GUILDS],
    listeners: {
        ready(client) {
            console.log(`Logged in as ${client.user.username}`);
        }
    }
});
