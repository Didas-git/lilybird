import type { ApplicationCommand } from "@lilybird/handlers";
import { ApplicationIntegrationType, InteractionContextType } from "lilybird";

export default {
    post: "GLOBAL",
    data: {
        name: "ping",
        description: "pong",
        integration_types: [
            ApplicationIntegrationType.GUILD_INSTALL,
            ApplicationIntegrationType.USER_INSTALL
        ],
        contexts: [
            InteractionContextType.BOT_DM,
            InteractionContextType.GUILD,
            InteractionContextType.PRIVATE_CHANNEL
        ],
    },
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
} satisfies ApplicationCommand;
