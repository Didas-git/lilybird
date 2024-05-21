import type { ApplicationCommand } from "@lilybird/handlers";

export default {
    post: "GLOBAL",
    data: { name: "ping", description: "pong" },
    run: async (interaction) => {
        await interaction.deferReply();

        const { ws, rest } = await interaction.client.ping();

        await interaction.editReply({
            content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``
        });
    }
} satisfies ApplicationCommand;
