---
title: Handling Message Commands
description: How to use lilybird's simple handlers for application commands.
sidebar:
  order: 2
---

Currently the `@lilybird/handlers` package provides only one way of handling application commands, however, I can assure you there are more to come.

## Creating a simple command

Let's create a simple `ping` command to demonstrate how it works.

```diff lang="ts" title="index.ts"
import { createClient, Intents } from "lilybird";
+import { createHandler } from "@lilybird/handlers/simple";

+const listeners = await createHandler({
+    dirs: {
+        messageCommands: `${import.meta.dir}/message-commands`,
+    }
+})

await createClient({
  token: process.env.TOKEN,
  intents: [Intents.GUILD_MESSAGES, Intents.MESSAGE_CONTENT],
-  listeners: {/* your listeners */}
+  ...listeners
})
```

:::note
The second argument, `args`, is the result of running the following code:

```ts
message.content.slice(this.prefix.length)
  .trim()
  .split(/\s+/g)
  .shift();
```

:::

```ts title="message-commands/ping.ts"
import { MessageCommand } from "@lilybird/handlers/simple";

export default {
  name: "ping",
  run: async (message, args) => {
    const { ws, rest } = await message.client.ping();

    await message.reply({
      content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``,
    });
  },
} satisfies MessageCommand;
```

:::note
The above code was taken from the [Bun Discord bot](https://github.com/xHyroM/bun-discord-bot), join the Bun Discord server to see it in action.
:::
