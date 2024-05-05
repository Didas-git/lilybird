import type { Event } from "@lilybird/handlers";

export default {
  event: "messageCreate",
  async run(message) {
    console.log(await message.poll?.end());
  }
} satisfies Event<"messageCreate">;
