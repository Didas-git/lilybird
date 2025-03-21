---
title: Handling Events
description: How to use lilybird's simple handlers for events.
sidebar:
  order: 1
---

The `@lilybird/handlers` package includes the Simple handler for handling events, but more advanced methods are now available.

## Creating a listener

```diff lang="ts" title="index.ts"
import { createClient, Intents } from "lilybird";
+import { createHandler } from "@lilybird/handlers/simple";

+const listeners = await createHandler({
+    dirs: {
+        listeners: `${import.meta.dir}/listeners`,
+    }
+})

await createClient({
  token: process.env.TOKEN,
  intents: [Intents.GUILDS],
-  listeners: {/* your listeners */}
+  ...listeners
})
```

```ts title="listeners/ready.ts"
import { Event } from "@lilybird/handlers/simple";

export default {
  event: "ready",
  run: (client) => {
    console.log(`Logged in as ${client.user.username}`);
  },
  // This duplication is needed for TypeScript types to work properly
  // This is also why this API isn't the best
} satisfies Event<"ready">;
```
