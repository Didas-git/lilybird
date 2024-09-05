import type { ApplicationCommand } from "@lilybird/handlers/simple";
import { Message } from "@lilybird/transformers";

export default {
    post: "GLOBAL",
    data: { name: "bananas-poll", description: "create bananas poll" },
    run: async (interaction) => {
        await interaction.reply({
            poll: {
                question: {
                    text: "Do you like bananas?"
                },
                answers: [
                    {
                        answer_id: 0,
                        poll_media: { text: "Yes!" }
                    },
                    {
                        answer_id: 1,
                        poll_media: { text: "No!" }
                    }
                ],
                allow_multiselect: false,
                duration: 168
            }
        });

        setTimeout(async () => {
            const msg = new Message(
                interaction.client,
                await interaction.client.rest.getOriginalInteractionResponse(interaction.client.application.id, interaction.token)
            );

            console.log(await msg.poll?.answers[0].fetchVoters({}));
        }, 3000);
    }
} satisfies ApplicationCommand;
