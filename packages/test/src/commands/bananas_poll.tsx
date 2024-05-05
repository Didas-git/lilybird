import type { ApplicationCommand } from "@lilybird/handlers";

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
    })
  }
} satisfies ApplicationCommand;
