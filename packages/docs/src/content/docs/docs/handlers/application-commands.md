---
title: Handling Application Commands
description: How to use Lilybird's handlers for application commands.
---

Currently the `@lilybird/handlers` package provides only one way of handling application commands, however, I can assure you there are more to come.

To be completely honest, the current API is not the greatest but was the fastest one for a demo.

## Creating a simple command

Lets create a simple `ping` command to demonstrate how it works.

:::caution[Important]
While in the example, we're using `@lilybird/jsx` to create the command data, you don't need to use it. You can simply use a normal object. If you're using TypeScript, you'll still have intellisense
:::

```diff lang="ts" title="index.ts"
import { createClient, Intents } from "lilybird";
+import { createHandler } from "@lilybird/handlers";

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
import { ApplicationCommand } from "@lilybird/jsx";
import { SlashCommand } from "@lilybird/handlers";

export default {
  post: "GLOBAL",
  data: <ApplicationCommand name="ping" description="pong" />,
  run: async (interaction) => {
    const { ws, rest } = await interaction.client.ping();

    await interaction.reply({
      content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``
    });
  },
} satisfies SlashCommand
```

:::note
The above code was taken from the [Bun Discord bot](https://github.com/xHyroM/bun-discord-bot), join the Bun Discord server to see it in action.
:::