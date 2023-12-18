---
title: Receiving messages
description: Use lilybird to listen and answer to messages.
sidebar:
  order: 4
---

## Receiving and replying to messages

### Direct reply

When using `<Message>.reply` the message will include a `message_reference` which just means it works like you replying to a message in discord.

```ts
await createClient({
  ...,
  listeners: {
    async messageCreate(message) {
      await message.reply("Hii~")
    }
  }
});
```

### Sending a message

If you do not wish to reply you can always use the `<Channel>.send` method to send a message in the same channel.

```ts
await createClient({
  ...,
  listeners: {
    async messageCreate(message) {
      const channel = await message.fetchChannel();
      await channel.send("Hii~");
    }
  }
});
```

:::note
Other methods like `react` do also exist within the message object.
:::