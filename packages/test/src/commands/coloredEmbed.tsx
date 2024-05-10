import type { SlashCommand } from "@lilybird/handlers";
import { Embed } from "@lilybird/jsx";
import { Colors, parseHexToByte10, rgbToByte10 } from '@lilybird/helpers'

export default {
    post: "GLOBAL",
    data: { name: "colored_embed", description: "Send colored embed" },
    run: async (interaction) => {
        await interaction.deferReply();

        const { ws, rest } = await interaction.client.ping();

        const embed = Embed({ title: "Ping", description: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``, color: Colors.SpringGreen });
        const hexColorEmbed = Embed({ title: "Ping", description: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``, color: parseHexToByte10('#FFFFFF') });
        const rgbColorEmbed = Embed({ title: "Ping", description: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``, color: rgbToByte10([255, 255, 0]) });
        const rgbaColorEmbed = Embed({ title: "Ping", description: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``, color: rgbToByte10([134, 210, 20, 0.874358239845]) });

        await interaction.editReply({
            embeds: [embed, hexColorEmbed, rgbColorEmbed, rgbaColorEmbed]
        });

        console.log(Bun.inspect(interaction.client.cache, {
            colors: true,
            depth: 1
        }));
    }
} satisfies SlashCommand;
