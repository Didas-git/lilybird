import { $listener } from "@lilybird/handlers";

$listener({
    event: "ready",
    handle(client) {
        console.log("Connected as", client.user.username);
    }
});
