---
title: Registering Application Commands
description: Use lilybird to configure application commands.
---

To create application commands, you can simply use the rest client that is attached to the client to do so.

We highly encourage using the `setup` api to do this since to facilitates the access to the client and runs before the ready event.

## Creating Global Commands

```ts
import { createClient, ApplicationCommandType } from "lilybird";

await createClient({
  ...,
  setup: async (client) => {
    await client.rest.createGlobalApplicationCommand(client.user.id, {
      name: "ping",
      type: ApplicationCommandType.CHAT_INPUT
    });
  }
});
```

## Creating Guild Commands

```diff lang="ts"
import { createClient, ApplicationCommandType } from "lilybird";

await createClient({
  ...,
  setup: async (client) => {
-    await client.rest.createGlobalApplicationCommand(client.user.id, {
+    await client.rest.createGuildApplicationCommand(client.user.id, guildId, {
      name: "ping",
      type: ApplicationCommandType.CHAT_INPUT
    });
  }
});
```

## Bulk creating/updating commands

Discord does not provide any `POST` methods for creating more than 1 command at once.
However they provide bulk `PUT` methods that you can use if you so choose to.

The commands are:
- `bulkOverwriteGlobalApplicationCommand` - For bulk create/update global commands
- `bulkOverwriteGuildApplicationCommand` - For bulk create/update guild commands

Both of them get an array of commands instead of an object, but, other than that its pretty much the same.