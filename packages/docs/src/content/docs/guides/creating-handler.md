---
title: Creating a Simple Handler
description: Learn how to create a simple handler with Lilybird.
---

Creating a command handler might look daunting at first because of Lilybird's interface, but, I can assure you that it's simple.

For our examples, we will be using [`Bun.Glob`](https://bun.sh/docs/api/glob) because, well, it's Bun. However, you can also explore other options like `fs.readdir`.

## Creating an event handler

Handling events is trivial. All we need to do is read a file and pass the function as a listener.

We will be using the following event structure for this example:

```ts
import type { ClientEventListeners } from "lilybird";

export interface Event<
  E extends keyof ClientEventListeners = keyof ClientEventListeners,
  T extends Required<ClientEventListeners> = Required<ClientEventListeners>
> {
  name?: string;
  event: E;
  run: (...args: Parameters<T[E]>) => Awaitable<any>;
}

```

Let's start by creating our main function and read all the files in a directory.

```ts title="event-handler.ts"
import { join } from "path";
import type { ClientEventListeners } from "lilybird";

function createEventListeners(directory: string): ClientEventListeners {
  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx}");
  const files = glob.scan(directory);
}
```

After getting all the files in the directory we can start iterating over them and importing the files.

```diff lang="ts" title="event-handler.ts"
import type { ClientEventListeners } from "lilybird";

function createEventListeners(directory: string): ClientEventListeners {
  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx}");
  const files = glob.scan(directory);

+  for await (const fileName of files) {
+    const event: Event = (await import(join(directory, fileName))).default;
+    if (typeof event === "undefined") continue;
+  }
}
```

Now that we have the file we can start building an object with all the listeners.

```diff lang="ts" title="event-handler.ts"
import type { ClientEventListeners } from "lilybird";

function createEventListeners(directory: string): ClientEventListeners {
  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx}");
  const files = glob.scan(directory);

+  const listeners: ClientEventListeners = {};

  for await (const fileName of files) {
    const event: Event = (await import(join(directory, fileName))).default;
    if (typeof event === "undefined") continue;
  }

+    listeners[event.event] = event.run;
  }

+  return listeners;
}
```

Now you can simply pass the return type into the client's `listeners` property and it will just work.

## Creating a slash command handler

A slash command handler is fairly similar to an event handler. The only difference is that you need to push the data to Discord using the REST API.

:::danger
For the sake of this example, we will be hardcoding a token and client ID.
There are better ways of doing this, but, they will be covered in another section.
:::

We will be using the following structure for our slash commands:

```ts
import type { 
  POSTApplicationCommandStructure,
  ApplicationCommandData,
  AutocompleteData, 
  Interaction,
  Awaitable
} from "lilybird";

export interface SlashCommand {
  data: POSTApplicationCommandStructure;
  autocomplete?: (interaction: Interaction<AutocompleteData>) => Awaitable<any>;
  run: (interaction: Interaction<ApplicationCommandData>) => Awaitable<any>;
}
```

Before creating the handler let's take a look at building the `onInteraction` helper.

```ts title="command-handler.ts"
const slashCommands = new Map<string, SlashCommand>();

async function onInteraction(interaction: Interaction): Promise<void> {
  if (interaction.isApplicationCommandInteraction()) {
    await slashCommands.get(interaction.data.name)?.run(interaction);
  } else if (interaction.isAutocompleteInteraction()) {
    await slashCommands.get(interaction.data.name)?.autocomplete?.(interaction);
  }
}
```

Now that we have the helper let's use our event handler as a base and modify it.

```diff lang="ts" title="command-handler.ts" del=" Event " ins=" SlashCommand "
import type { ClientEventListeners, REST } from "lilybird";

+const rest = new REST(YOUR_TOKEN);

function createEventListeners(directory: string): ClientEventListeners {
  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx}");
  const files = glob.scan(directory);

-  const listeners: ClientEventListeners = {};

  for await (const fileName of files) {
-    const event: Event = (await import(join(directory, fileName))).default;
+    const command: SlashCommand = (await import(join(directory, fileName))).default;
    if (typeof command === "undefined") continue;

-    listeners[event.event] = event.run;
+    slashCommands.set(command.data.name, command)
+    await rest.createGlobalApplicationCommand(YOUR_CLIENT_ID, command.data)
  }

-  return listeners;
+  return { interactionCreate: onInteraction }
}
```