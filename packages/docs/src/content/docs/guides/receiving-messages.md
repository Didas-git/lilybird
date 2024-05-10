---
title: Receiving and replying to messages
description: Use lilybird to listen and answer to messages.
sidebar:
  label: Receiving Messages
  order: 3
---

Sending messages can be done with the `REST` helper, and if you wish to do the same as a `reply` in discord you can use `message_reference`

```ts showLineNumbers
await createClient({
  ...,
  listeners: {
    messageCreate: async (client, message) => {
      await client.rest.createMessage(message.channel_id, { 
        content: "Hii~",
        message_reference: { message_id: message.id }
      });
    }
  }
});
```
