---
title: Handling Application Commands
description: Learn how to create and handle commands with Lilybird.
sidebar:
  order: 2
---

Interactions/Application Commands are the most important building block when it comes to discord bots nowadays.
The goal of this guide is to teach you how you can create and respond to application commands using the default (raw) listeners.

If you would like you can also inject transformers to aid you doing this, refer to the [transformers page](/api/transformers) for that.

:::note
This guide uses TypeScript for all the examples, if you are using JavaScript you should adapt accordingly.
:::

## Registering Commands

Registering an application command is the first step of this journey.

### Using the `setup` api

The recommended way of doing this is by using the `setup` api, we talk more about why in [this page](/api/setup).

```ts showLineNumbers
import type { Client } from "lilybird";

async function setup(client: Client): Promise<void> {
  // Lets register a command called 'ping'
  await client.rest.createGlobalApplicationCommand(client.user.id, {
    name: "ping",
    description: "pong",
  });
}
```

### Creating the listener/handler for our commands

Above we created a command called `ping` and now we want to handle it, lets create a simple handler to do this.

```ts showLineNumbers
import { type Client, Interaction, InteractionCallbackType } from "lilybird";

async function handleCommand(
  client: Client,
  interaction: Interaction.ApplicationCommandInteractionStructure
): Promise<void> {
  if (interaction.data.name === "ping") {
    const { ws, rest } = await client.ping();
    await client.rest.createInteractionResponse(interaction.id, interaction.token, {
      type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``,
      },
    });
  }
}
```

### Putting everything together

Now, everything left for us to do is put it all together.

```ts showLineNumbers collapse={10-31, 34-35}
import {
  type Client,
  InteractionType,
  createClient,
  Interaction,
  InteractionCallbackType,
  Intents,
} from "lilybird";

async function setup(client: Client): Promise<void> {
  // Lets register a command called 'ping'
  await client.rest.createGlobalApplicationCommand(client.user.id, {
    name: "ping",
    description: "pong",
  });
}

async function handleCommand(
  client: Client,
  interaction: Interaction.ApplicationCommandInteractionStructure
): Promise<void> {
  if (interaction.data.name === "ping") {
    const { ws, rest } = await client.ping();
    await client.rest.createInteractionResponse(interaction.id, interaction.token, {
      type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``,
      },
    });
  }
}

await createClient({
  token: process.env.TOKEN,
  intents: [Intents.GUILDS],
  // We pass the setup function we created above
  setup,
  listeners: {
    interactionCreate: async (client, payload) => {
      // We only want to handle guild interactions
      if (!("guild_id" in payload)) return;
      // We only want to handle application commands
      if (payload.type !== InteractionType.APPLICATION_COMMAND) return;

      await handleCommand(client, payload);
    },
  },
});
```
