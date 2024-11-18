import { Client, GatewayEvent, Intents } from "lilybird";

const client = new Client({
    intents: Intents.GUILDS,
    dispatch: (payload) => {
        if (payload.t === GatewayEvent.Ready) console.log(`Logged in as ${client.user.username}`);
    }
});

await client.login(process.env.TOKEN);
