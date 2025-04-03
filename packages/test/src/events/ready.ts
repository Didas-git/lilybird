import { $listener } from "../handlers.js";

$listener({
    event: "ready",
    handle(client) {
        console.log("Connected as", client.user.username);
    }
});
