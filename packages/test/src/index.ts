import { createHandler } from "@lilybird/handlers";
import { CachingDelegationType, Intents, createClient } from "lilybird";

const listeners = await createHandler({
    dirs: {
        slashCommands: `${import.meta.dir}/commands`,
        listeners: `${import.meta.dir}/events`
    }
});

await createClient({
    token: process.env.TOKEN,
    intents: [Intents.GUILDS],
    // attachDebugListener: true,
    caching: {
        delegate: CachingDelegationType.DEFAULT,
        applyTransformers: true,
        enabled: {
            guild: true,
            channel: true
        }
    },
    ...listeners
});
