import { ApplicationCommandOptionType, ButtonStyle, CollectorType, ComponentType } from "lilybird";
import type { MessageComponentStructure } from "lilybird";

import type { SlashCommand } from "@lilybird/handlers";

export default {
    post: "GLOBAL",
    data: {
        name: "collectors",
        description: "test collectors",
        options: [
            {
                type: ApplicationCommandOptionType.INTEGER,
                name: "type",
                description: "the type top test",
                choices: [
                    {
                        name: "User",
                        value: CollectorType.USER
                    },
                    {
                        name: "Button",
                        value: CollectorType.BUTTON_ID
                    },
                    {
                        name: "Both",
                        value: CollectorType.BOTH
                    }
                ],
                required: true,
                autocomplete: true
            }
        ]
    },
    run: async (interaction) => {
        if (!interaction.inGuild()) return;

        const buttons: MessageComponentStructure = {
            type: ComponentType.ActionRow,
            components: [
                {
                    type: ComponentType.Button,
                    style: ButtonStyle.Primary,
                    custom_id: "custom_test",
                    label: "Test"

                }
            ]
        };

        switch (interaction.data.getInteger("type", true) as CollectorType) {
            case CollectorType.USER: {
                interaction.client.createComponentCollector(CollectorType.USER, interaction.member.user.id, async (int) => {
                    await int.reply(`Yes you are ${int.member.user.username}`);
                });

                await interaction.reply({ components: [buttons] });
                break;
            }
            case CollectorType.BUTTON_ID: {
                interaction.client.createComponentCollector(CollectorType.BUTTON_ID, "custom_test", async (int) => {
                    if (!int.data.isButton()) throw new Error("This should have never happened");
                    await int.reply(`Someone interacted with the ${int.data.id} button`);
                });

                await interaction.reply({ components: [buttons] });
                break;
            }
            case CollectorType.BOTH: {
                interaction.client.createComponentCollector(CollectorType.BOTH, interaction.member.user.id, "custom_test", async (int) => {
                    if (!int.data.isButton()) throw new Error("This should have never happened");
                    await int.reply(`${int.member.nick ?? int.member.user.username} interacted with the ${int.data.id} button`);
                });

                await interaction.reply({ components: [buttons] });
                break;
            }
        }
    }
} satisfies SlashCommand;
