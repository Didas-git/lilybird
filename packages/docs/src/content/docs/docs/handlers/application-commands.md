---
title: Handling Application Commands
description: How to use lilybird's handlers for application commands.
---

Currently the `@lilybird/handlers` package provides only one way of handling application commands however i can assure you there are more to come.

To be completely honest, the current api is not the greatest but was the fastest one for a demo.

## Creating a simple command

Lets create a simple `ping` command to show how it works.

:::caution[Important]
While in the example we are using `@lilybird/jsx` to create the command data you cont need to use it, you can use a normal object and if you are using typescript you will have intellisense
:::

```diff lang="ts" title="index.ts"
import { createClient, Intents } from "lilybird";
+import { createHandler } from "@lilybird/handlers";

+const listeners = await createHandler({
+    dirs: {
+        slashCommands: `${import.meta.dir}/commands`,
+    }
+})

await createClient({
    token: process.env.TOKEN,
    intents: [Intents.GUILDS],
-    listeners: {/* your listeners */}
+    ...listeners
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

        await interaction.editReply({
            content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``
        });
    },
} satisfies SlashCommand
```

:::note
The above code was taken from the [bun discord bot](https://github.com/xHyroM/bun-discord-bot), join the bun discord to see it working.
:::