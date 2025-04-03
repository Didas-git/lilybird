import {
    InteractionCallbackType,
    ApplicationCommandType,
    InteractionType,
    createClient,
    Intents
} from "lilybird";

await createClient({
    token: process.env.TOKEN,
    intents: Intents.GUILDS,
    listeners: {
        setup: async (client, payload) => {
            await client.rest.bulkOverwriteGlobalApplicationCommand(client.user.id, [
                {
                    name: "ping"
                }
            ]);

            console.log(`Logged in as ${payload.user.username}`);
        },
        interactionCreate: async (client, payload) => {
            // We will only be handling Guild interactions
            // so we do this properly narrow down the type
            if (!("guild_id" in payload)) return;
            // In this block we only want to handle chat input commands
            if (payload.type === InteractionType.APPLICATION_COMMAND && payload.data.type === ApplicationCommandType.CHAT_INPUT) {
                // Inside this block we can handle our ping command
                if (payload.data.name === "ping") {
                    await client.rest.createInteractionResponse(payload.id, payload.token, {
                        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: "Pong!"
                        }
                    });
                    return;
                }
            }
        }
    }
});
