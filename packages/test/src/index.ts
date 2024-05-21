import { DebugIdentifier, Intents, createClient } from "lilybird";
import { createHandler } from "@lilybird/handlers/advanced";

const handlers = await createHandler({
    cachePath: `${import.meta.dir}/lily-cache/handler`,
    directoryPaths: { applicationCommands: `${import.meta.dir}/commands-adv` }
}, (identifier, payload) => { console.log(identifier, payload ?? ""); });

await createClient({
    token: process.env.TOKEN,
    intents: [Intents.GUILDS],
    attachDebugListener: true,
    debugListener(identifier, payload) {
        if (identifier === DebugIdentifier.Message) return;
        console.log(identifier, payload ?? "");
    },
    ...handlers
});
