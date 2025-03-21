---
title: Handling Events
description: How to use lilybird's handlers for events.
sidebar:
  order: 1
---

## Creating a listener

Lets create a `ready` listener to demonstrate how it works.

```diff lang="ts" title="index.ts"
import { createClient, Intents } from "lilybird";
+import { handler } from "@lilybird/handlers/advanced";

+handler.cachePath = `${import.meta.dir}/lily-cache/handler`;
+await handler.scanDir(`${import.meta.dir}/listeners`);

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

```ts title="listeners/ready.ts" showLineNumbers
import { $listener } from "@lilybird/handlers/advanced";

$listener({
  event: "ready",
  handle: (client) => {
    console.log("Connected as", client.user.username);
  },
});
```
