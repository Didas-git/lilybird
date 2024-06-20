import { $applicationCommand } from "@lilybird/handlers/advanced";

import type { Interaction } from "@lilybird/transformers";

$applicationCommand({
    name: "ping",
    description: "pong",
    handle: async (interaction: Interaction): Promise<void> => {
        await interaction.deferReply();
        const { ws, rest } = await interaction.client.ping();

        await interaction.editReply({
            content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``
        });
    }
});
