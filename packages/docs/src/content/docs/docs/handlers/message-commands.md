---
title: Handling Message Commands
description: How to use lilybird's handlers for application commands.
---

Currently the `@lilybird/handlers` package provides only one way of handling application commands however i can assure you there are more to come.

## Creating a simple command

Lets create a simple `ping` command to show how it works.

```diff lang="ts" title="index.ts"
import { createClient, Intents } from "lilybird";
+import { createHandler } from "@lilybird/handlers";

+const listeners = await createHandler({
+    dirs: {
+        messageCommands: `${import.meta.dir}/commands`,
+    }
+})

await createClient({
  token: process.env.TOKEN,
  intents: [Intents.GUILDS],
-  listeners: {/* your listeners */}
+  ...listeners
})
```

:::note
The second argument `args` is the result of running the following code:
```ts
message.content.slice(this.prefix.length)
  .trim()
  .split(/\s+/g)
  .shift()
```
:::

```ts title="commands/ping.ts"
import { MessageCommand } from "@lilybird/handlers";

export default {
  name: "ping",
  run: async (message, args) => {
    const { ws, rest } = await message.client.ping();

    await message.edit({
      content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``
    });
  },
} satisfies MessageCommand
```

:::note
The above code was taken from the [bun discord bot](https://github.com/xHyroM/bun-discord-bot), join the bun discord to see it working.
:::