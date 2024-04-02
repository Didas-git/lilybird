---
title: No Events
description: Learn and understand the no-events approach taken by lilybird.
sidebar:
  order: 0
---

As you might have noticed by now Lilybird does not have an events API and you might be questioning this decision so let's discuss the motivation behind this.

The main motivation behind not having events is performance. Event emitters are really bad when it comes to high throughput and are really easy for the user to misuse them and cause memory leaks. To avoid these issues we went with the same approach that `uws` and, for that matter, `bun` use for their WebsocketServer: callbacks.

You might be wondering, "so how can I listen to events or even collect message components?".

Let me answer that for you. Usually, it's very unlikely that you need to listen to an event more than once. If you do find yourself in that situation, you can always create multiple functions and call them from the same listeners, like so::

```ts showLineNumbers
import { createClient, Intents } from "lilybird"

function useInteraction1(interaction) {
  console.log(interaction.token);
}

function useInteraction2(interaction) {
  console.log(interaction.data);
}

await createClient({
  token: process.env.TOKEN,
  intents: [Intents.GUILDS],
  listeners: {
    interactionCreate: (interaction) => {
      useInteraction1(interaction);
      useInteraction2(interaction);
    }
  }
})
```

As for collecting message components, I'm currently working on an API for collectors that I will try to make as extensible as possible so this should not be an issue once Lilybird has its first stable release.