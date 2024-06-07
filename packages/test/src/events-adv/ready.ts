import { $listener } from "@lilybird/handlers/advanced";

$listener({
    event: "ready",
    handle(client) {
        console.log("Connected as", client.user.username);
    }
});
