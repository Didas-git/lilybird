import { ButtonStyle } from "lilybird";
import { EmbedFooter, EmbedField, ActionRow, Embed, Button } from "@lilybird/jsx";
import type { Event } from "@lilybird/handlers";

export default ({
    event: "interactionCreate",
    async run(interaction) {
        if (interaction.inGuild()) {
            if (interaction.isApplicationCommandInteraction()) {
                await interaction.deferReply();

                const embed = (
                    <Embed title="Hello from TSX" color={0xff00ef} timestamp>
                        {Array.from({ length: 4 }, (_, i) => (
                            <EmbedField name={`Field ${i}`} value={i.toString()} inline />
                        ))}
                        <EmbedFooter text={`Hii ${interaction.member.user.username}`} />
                    </Embed>
                );

                setTimeout(async () => {
                    console.log(interaction.data.getAttachment("att", true));
                    await interaction.followUp("*hiii~*", { embeds: [embed] });

                    const simpleButtonRow = (
                        <ActionRow>
                            <Button id="test-p-button" label="Click Me" style={ButtonStyle.Primary} disabled />
                            <Button id="test-s-button" label="Graayy" style={ButtonStyle.Secondary} disabled />
                            <Button id="test-sc-button" label="Okay" style={ButtonStyle.Success} disabled />
                            <Button id="test-d-button" label="No" style={ButtonStyle.Danger} disabled />
                        </ActionRow>
                    );

                    await interaction.followUp("Here, some buttons", { components: [simpleButtonRow] });
                }, 1000);
            }
        }
    },
} as Event<"interactionCreate">);
