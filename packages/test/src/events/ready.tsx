import type { Event } from "@lilybird/handlers/simple";

export default {
    event: "ready",
    run(client) {
        console.log("Connected as", client.user.username);
    }
} satisfies Event<"ready">;
