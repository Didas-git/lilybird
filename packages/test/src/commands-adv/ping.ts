import { $applicationCommand } from "../handlers.js";

$applicationCommand({
    name: "ping",
    description: "pong",
    handle: async (interaction) => {
        await interaction.deferReply();
        const { ws, rest } = await interaction.client.ping();

        await interaction.editReply({
            content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``
        });
    }
});
