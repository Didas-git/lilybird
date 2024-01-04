---
title: Registering Application Commands
description: Use Lilybird to configure application commands.
sidebar:
  order: 2
---

To create application commands, you can simply use the REST client that is attached to the client.

We highly encourage using the `setup` API to do this since it facilitates access to the client and runs before the ready event.

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
However, they provide bulk `PUT` methods that you can use if you choose to.

The commands are:
- `bulkOverwriteGlobalApplicationCommand` - For bulk create/update global commands
- `bulkOverwriteGuildApplicationCommand` - For bulk create/update guild commands

Both of them take an array of commands instead of an object, but, other than that, it's pretty much the same.