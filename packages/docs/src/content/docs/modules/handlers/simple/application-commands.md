---
title: Handling Application Commands
description: How to use Lilybird's simple handlers for application commands.
sidebar:
  order: 0
---

The `@lilybird/handlers` package includes a Simple handler for handling application commands, but more advanced options are now available.

To be completely honest, this API is not the greatest, but was the fastest one for a demo.

## Creating a simple command

Lets create a simple `ping` command to demonstrate how it works.

```diff lang="ts" title="index.ts"
import { createClient, Intents } from "lilybird";
+import { createHandler } from "@lilybird/handlers/simple";

+const listeners = await createHandler({
+  dirs: {
+    slashCommands: `${import.meta.dir}/commands`,
+  }
+})

await createClient({
  token: process.env.TOKEN,
  intents: [Intents.GUILDS],
-  listeners: {/* your listeners */}
+  ...listeners
})
```

```tsx title="commands/ping.tsx"
import { GlobalApplicationCommand } from "@lilybird/handlers/simple";

export default {
  post: "GLOBAL",
  data: {
    name: "ping",
    description: "pong",
  },
  run: async (interaction) => {
    const { ws, rest } = await interaction.client.ping();

    await interaction.reply({
      content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``,
    });
  },
} satisfies GlobalApplicationCommand;
```

:::note
The above code was taken from the [Bun Discord bot](https://github.com/xHyroM/bun-discord-bot), join the Bun Discord server to see it in action.
:::
