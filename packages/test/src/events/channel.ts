import type { Event } from "@lilybird/handlers";

export default ({
    event: "channelCreate",
    run(channel) {
        console.log(channel);
    }
} as Event<"channelCreate">);
