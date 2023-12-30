---
title: The Handler API
description: How lilybird's handler api works.
---

The current handler API is quite simple. You have a class that you can extend, containing methods for loading files, loading commands, and the function responsible for creating the listeners.

Now, let's break down the function and helpers used to create the listeners and explain how we are circumventing the limitations of not having event listeners.

## Building the Listeners

As highlighted in **gray** in the code below, we create two placeholder functions. This allows you to have your own listener without conflicting with the handler.

:::caution
Be careful and avoid modifying the `interaction` object at all costs. Since objects are passed by reference, if you mutate them in your listeners, the changes will pass to the command handler. While you can use this to your advantage, we highly advise against it.
:::


```ts {2, 3}
public buildListeners(): ClientEventListeners {
  let interactionCreateFn = function () { return; };
  let messageCreateFn = function () { return; };

  const listeners: ClientEventListeners = {};

  for (const [name, event] of this.events) {
    if (name === "interactionCreate") {
      interactionCreateFn = event.run;
      continue;
    }

    if (name === "messageCreate") {
      messageCreateFn = event.run;
      continue;
    }

    listeners[name] = event.run;
  }

  listeners.interactionCreate = async (interaction) => {
    await interactionCreateFn(interaction);
    await this.onInteraction(interaction);
  };

  listeners.messageCreate = async (message) => {
    await messageCreateFn(message);
    await this.onMessage(message);
  };

  return listeners;
}
```

## Registering the Commands

Lilybird has a neat API that makes this job trivial.

The `setup` API is a simple callback that the client runs the moment it connects to Discord. In the future, this will be changed so it gets called even before the connection is established.

This is why when you call `createHandler`, you spread the result into the client options instead of passing the variable.