import { ApplicationCommand, AttachmentOption } from "@lilybird/jsx";
import type { Event } from "@lilybird/handlers";

export default ({
    event: "ready",
    async run(client) {
        // console.log("Connected!\n", client);

        const command = (
            <ApplicationCommand name="test" description="its just a test">
                <AttachmentOption name="att" description="a att" required />
            </ApplicationCommand>
        );

        await client.rest.createGuildApplicationCommand(client.user.id, process.env.TEST_GUILD_ID, command);

        console.log(await client.ping());
    }
} as Event<"ready">);
