---
title: Handling Application Commands
description: Learn how to create and handle commands with Lilybird.
---

Interactions/Application Commands are the most important building block when it comes to discord bots nowadays.
The goal of this guide is to teach you how you can create and respond to application commands using **raw** listeners.

If you would like you can also inject transformers to aid you doing this, refer to the [Upcoming Page] for that.

:::note
This guide uses TypeScript for all the examples, if you are using JavaScript you should adapt accordingly.
:::

## Registering Commands

Registering an application command is the first step of this journey.

### Creating the `ready` listener

There are a few ways you can do this, we will be registering our commands using the `ready` listener, but, you could also use the `setup` api just like handlers do (or should).

So, lets create a helper function for this.

```ts
import type { Client } from "lilybird";

async function ready(client: Client): Promise<void> {
  console.log(`Logged in as ${client.user.username}`);

  // Lets register a command called 'ping'
  await client.rest.createGlobalApplicationCommand(client.user.id, {
    name: "ping",
    description: "pong"
  });
}
```

### Creating the listener/handler for our commands

Above we created a command called `ping` and now we want to handle it, lets create a simple handler to do this.

```ts
import type { 
  ApplicationCommandInteractionStructure,
  InteractionStructure,
  Client,
} from "lilybird";

async function handleCommand(
  client: Client, 
  interaction: ApplicationCommandInteractionStructure
): Promise<void> {
  if (interaction.data.name === "ping") {
    const { ws, rest } = await client.ping();
    await client.rest.createInteractionResponse(interaction.id, interaction.token, {
      type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
          content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``
      }
    });
  }
}
```

### Putting everything together

Now, everything left for us to do is put it all together.

```ts
import {
  InteractionType,
  createClient
} from "lilybird";

await createClient({
  ...,
  listeners: {
    ready,
    interactionCreate: async (client, payload) => {
      // We only want to handle guild interactions
      if (!("guild_id" in payload)) return;
      // We only want to handle application interactions
      if (payload.type !== InteractionType.APPLICATION_COMMAND) return;

      await handleCommand(client, payload);
    }
  }
});
```