import type { Event } from "@lilybird/handlers";

export default {
    event: "ready",
    run(client) {
        console.log("Connected as", client.user.username);
    }
} satisfies Event<"ready">;
