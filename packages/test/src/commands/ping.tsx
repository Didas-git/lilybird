import type { SlashCommand } from "@lilybird/handlers";

export default {
    post: "GLOBAL",
    data: { name: "ping", description: "pong" },
    run: async (interaction) => {
        await interaction.deferReply();

        const { ws, rest } = await interaction.client.ping();

        await interaction.editReply({
            content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``
        });

        console.log(Bun.inspect(interaction.client.cache, {
            colors: true,
            depth: 1
        }));
    }
} satisfies SlashCommand;
