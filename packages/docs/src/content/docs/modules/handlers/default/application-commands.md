---
title: Handling Application Commands
description: How to use Lilybird's handlers for application commands.
sidebar:
  order: 0
---

## Creating a simple command

Lets create a simple `ping` command to demonstrate how it works.

```diff lang="ts" title="index.ts"
import { createClient, Intents } from "lilybird";
+import { handler } from "@lilybird/handlers/advanced";

+handler.cachePath = `${import.meta.dir}/lily-cache/handler`;
+await handler.scanDir(`${import.meta.dir}/commands`);

await createClient({
  token: process.env.TOKEN,
  intents: [Intents.GUILDS],
-  listeners: {/* your listeners */}
+  setup: async (client) => {
+     await handler.loadGlobalCommands(client);
+  },
+  listeners: handler.getListenersObject()
})
```

```ts title="commands/ping.ts" showLineNumbers
import { $applicationCommand } from "@lilybird/handlers/advanced";

$applicationCommand({
  name: "ping",
  description: "pong",
  handle: async (client, interaction) => {
    const { ws, rest } = await client.ping();
    await client.rest.createInteractionResponse(interaction.id, interaction.token, {
      type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``
      }
    });
  },
});
```

## Handling Sub Commands

Handling sub commands with lilybird's handler is extremely simple, you write it just like you would for a normal command.

```js showLineNumbers
import { $applicationCommand } from "@lilybird/handlers/advanced";
import { ApplicationCommandOptionType } from "lilybird";

$applicationCommand({
  name: "wrapper",
  description: "A wrapper group for basic commands",
  options: [
    {
      type: ApplicationCommandOptionType.SUB_COMMAND,
      name: "ping",
      description: "pong",
      handle: async (client, interaction) => {
        const { ws, rest } = await client.ping();
        await client.rest.createInteractionResponse(interaction.id, interaction.token, {
          type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``
          }
        });
      },
    }
  ]
});
```