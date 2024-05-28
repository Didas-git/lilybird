import { DebugIdentifier, Intents, createClient } from "lilybird";
import { handler } from "@lilybird/handlers/advanced";

handler.cachePath = `${import.meta.dir}/lily-cache/handler`;
handler.addDebugListener((identifier, payload) => { console.log(identifier, payload ?? ""); });

await handler.scanDir(`${import.meta.dir}/commands-adv`);

await createClient({
    token: process.env.TOKEN,
    intents: [Intents.GUILDS],
    attachDebugListener: true,
    debugListener(identifier, payload) {
        if (identifier === DebugIdentifier.Message) return;
        console.log(identifier, payload ?? "");
    },
    setup: async (client) => {
        await handler.loadGlobalCommands(client);
    },
    listeners: {
        interactionCreate: handler.compile() ?? (() => undefined)
    }
});
