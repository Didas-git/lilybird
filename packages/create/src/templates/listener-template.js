export default {
    event: "ready",
    run(client) {
        console.log("Connected as", client.user.username);
    }
};