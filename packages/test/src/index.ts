import { createHandler } from "@lilybird/handlers";
import { DebugIdentifier, Intents, createClient } from "lilybird";

const listeners = await createHandler({
    dirs: {
        slashCommands: `${import.meta.dir}/commands`,
        listeners: `${import.meta.dir}/events`
    }
});

await createClient({
    token: process.env.TOKEN,
    intents: [Intents.GUILDS, Intents.GUILD_MESSAGES, Intents.MESSAGE_CONTENT],
    attachDebugListener: true,
    debugListener(identifier, payload) {
        if (identifier === DebugIdentifier.Message) return;
        console.log(identifier, payload ?? "");
    },
    ...listeners
});
