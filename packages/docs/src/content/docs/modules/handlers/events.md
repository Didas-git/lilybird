---
title: Handling Events
description: How to use lilybird's handlers for events.
sidebar:
  order: 1
---

Currently the `@lilybird/handlers` package provides only one way of handling events, however, I can assure you there are more to come.

## Creating a listener

```diff lang="ts" title="index.ts"
import { createClient, Intents } from "lilybird";
+import { createHandler } from "@lilybird/handlers";

+const listeners = await createHandler({
+    dirs: {
+        events: `${import.meta.dir}/events`,
+    }
+})

await createClient({
  token: process.env.TOKEN,
  intents: [Intents.GUILDS],
-  listeners: {/* your listeners */}
+  ...listeners
})
```

```ts title="events/ping.ts"
import { Event } from "@lilybird/handlers";

export default {
  event: "ready",
  run: (client) => {
    console.log(`Logged in as ${client.user.username}`);
  },
// This duplication is needed for TypeScript types to work properly
// This is also why this API isn't the best
} satisfies Event<"ready">
```