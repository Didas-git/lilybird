---
title: Transformers
description: Lets learn what are transformers in lilybird.
sidebar:
  order: 2
---

Transformers in lilybird are what allow us to diverge from other libraries and not lock in users into an arbitrary api.

By default the core will send you the data as is from discord, which means, the default behavior of the core is to send raw data to the listeners. What transformers allow you to do is intercept those payloads to create an abstraction/api using the raw data before sending said data to the listener.

## Type Definitions

```ts
export const enum TransformerReturnType {
    /** The transformer only returns a single element. */
    SINGLE,
    /**
     * The transformer returns an array with multiple elements.
     * This elements will be spread onto the listener call.
    */
    MULTIPLE
}

type Transformer<T> = {
    return: TransformerReturnType,
    handler: (...args: [client: Client, payload: T]) => unknown
};
```

## Using the API

Using the api is straight forward, the transformers are named the same as the listener they will affect so for example, the `interactionCreate` transformer will only apply to the `interactionCreate` listener.

### Without Transformers

```ts
import { createClient, Intents } from "lilybird";

await createClient({
  token: process.env.TOKEN,
  intents: [Intents.GUILDS],
  listeners: {
    // We get the client and payload, so we can do what we want with them
    ready: (client, payload) => {
      console.log(client.user.id, payload.user.id);
    }
  }
})
```

### With Transformers

```ts
import { createClient, Intents, TransformerReturnType } from "lilybird";

await createClient({
  token: process.env.TOKEN,
  intents: [Intents.GUILDS],
  transformers: {
    ready: {
      return: TransformerReturnType.SINGLE,
      // Now the transformers are the ones who receive both the client and payload
      handler: (client, payload) => {
        console.log(client.user.id, payload.user.id);
        return payload.user.id;
      }
    }
  },
  listeners: {
    // And the actually listener only gets the returned value
    // Which in this example is the user id
    ready: (id) => {
      console.log(id);
    }
  }
})
```