---
title: The Handler API
description: How lilybird's handler api works.
---

The current handler api is fairly simple, you have a class that you can extend that contains the methods that load the files, the ones that load the commands and the function that is responsible for creating the listeners.

Lets break down the function and helpers used to create the listeners and explain how we are circumventing the limitations ov not having event listeners.

## Building the listeners

As we can see highlighted in **gray** in the code bellow we create 2 placeholder functions, this is so you can have your own listener without conflicting with the handler.

:::caution
You should be careful and avoid at all costs modifying the `interaction` object, since objects are passed by reference if you mutate in your listeners the changes will pass to the command handler.

While you can use that on your favor we highly advise against it.
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

## Registering the commands

Lilybird has a neat api that makes this job trivial.

The `setup` api is a simple callback that the client runs the moment it connects to discord. In the future this will be change so it gets called even before the connection is called.

This is why when you call `createHandler` you spread the result into the client options instead of passing the variable.