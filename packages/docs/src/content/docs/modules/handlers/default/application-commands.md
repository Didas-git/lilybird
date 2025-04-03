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
import { InteractionCallbackType } from "lilybird";
import { $applicationCommand } from "@lilybird/handlers/advanced";

$applicationCommand({
  name: "ping",
  description: "pong",
  handle: async (client, interaction) => {
    const { ws, rest } = await client.ping();
    await client.rest.createInteractionResponse(interaction.id, interaction.token, {
      type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``,
      },
    });
  },
});
```

## Handling Sub Commands

Handling sub commands with lilybird's handler is extremely simple, you write it just like you would for a normal command.

```js showLineNumbers collapse={13-19}
import { InteractionCallbackType, ApplicationCommandOptionType } from "lilybird";
import { $applicationCommand } from "@lilybird/handlers/advanced";

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
            content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``,
          },
        });
      },
    },
  ],
});
```

Also, instead of a sub command object, you can use the `$subCommand` function.

```js showLineNumbers collapse={9-15}
import { InteractionCallbackType, ApplicationCommandOptionType } from "lilybird";
import { $applicationCommand, $subCommand } from "@lilybird/handlers/advanced";

const subCommand = $subCommand({
  name: "ping",
  description: "pong",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  handle: async (client, interaction) => {
    const { ws, rest } = await client.ping();
    await client.rest.createInteractionResponse(interaction.id, interaction.token, {
      type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``,
      },
    });
  },
});

$applicationCommand({
  name: "wrapper",
  description: "A wrapper group for basic commands",
  options: [subCommand],
});
```
