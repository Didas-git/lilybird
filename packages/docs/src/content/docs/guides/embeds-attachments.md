---
title: Embeds & Attachments
description: Learn how to use embeds and send attachments with lilybird.
sidebar:
  order: 4
---

## Embeds

Embeds in lilybird are a 1:1 of the [discord docs](https://discord.com/developers/docs/resources/channel#embed-object-embed-structure), to put it simple, they are just plain objects with no abstractions or name changes.

To send an embed you just need to pass it to any method that supports it (liked `createMessage` and `createInteractionResponse`).

```ts showLineNumbers collapse={1-19, 31-33}
import {
  InteractionCallbackType,
  InteractionType,
  createClient,
  Intents
} from "lilybird";

await createClient({
  token: process.env.TOKEN,
  intents: Intents.GUILDS,
  listeners: {
    // We pass the setup function we created above
    setup,
    interactionCreate: async (client, payload) => {
      // We only want to handle guild interactions
      if (!("guild_id" in payload)) return;
      // We only want to handle application commands
      if (payload.type !== InteractionType.APPLICATION_COMMAND) return;

      await client.rest.createInteractionResponse(interaction.id, interaction.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: "Hello, Embed!",
              description: "This is an embedded message."
            }
          ]
        }
      });
    }
  }
});
```

## Attachments

Attachments in lilybird work a bit differently from what you might be used to.

Methods that accept attachments will have an extra field usually called `files` where you pass an array with the files you want to make attachments, the client will auto generate the `attachments` field for you.

```ts showLineNumbers collapse={1-19, 26-28}
import {
  InteractionCallbackType,
  InteractionType,
  createClient,
  Intents
} from "lilybird";

await createClient({
  token: process.env.TOKEN,
  intents: Intents.GUILDS,
  listeners: {
    // We pass the setup function we created above
    setup,
    interactionCreate: async (client, payload) => {
      // We only want to handle guild interactions
      if (!("guild_id" in payload)) return;
      // We only want to handle application commands
      if (payload.type !== InteractionType.APPLICATION_COMMAND) return;

      await client.rest.createInteractionResponse(interaction.id, interaction.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "This message has an attachment!"
        }
      }, [{ file: Bun.file("path/to/your/file.png"), name: "yourfilename.png" }]);
    }
  }
});
```

### Attachments in Embeds

To have your attachment inside an embed for example as an image, all you need to do is pass the url of your attachment to it

```ts showLineNumbers collapse={1-19, 32-33}
import {
  InteractionCallbackType,
  InteractionType,
  createClient,
  Intents
} from "lilybird";

await createClient({
  token: process.env.TOKEN,
  intents: Intents.GUILDS,
  listeners: {
    // We pass the setup function we created above
    setup,
    interactionCreate: async (client, payload) => {
      // We only want to handle guild interactions
      if (!("guild_id" in payload)) return;
      // We only want to handle application commands
      if (payload.type !== InteractionType.APPLICATION_COMMAND) return;

      await client.rest.createInteractionResponse(interaction.id, interaction.token, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: "Hello, Embed!",
              description: "This is an embedded message with an image.",
              image: { url: "attachment://yourfilename.png" }
            }
          ]
        }
      }, [{ file: Bun.file("path/to/your/file.png"), name: "yourfilename.png" }]);
    }
  }
});
```