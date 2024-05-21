import type { IApplicationCommandHandler } from "@lilybird/handlers/advanced";
import { ApplicationCommandHandler } from "@lilybird/handlers/advanced";

import type { Interaction } from "@lilybird/transformers";

export default class Ping extends ApplicationCommandHandler implements IApplicationCommandHandler {
    private constructor() {
        super({ name: "ping", description: "pong" });
    }

    public async execute(interaction: Interaction): Promise<void> {
        await interaction.deferReply();
        const { ws, rest } = await interaction.client.ping();

        await interaction.editReply({
            content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``
        });
    }
}
