---
title: Webhook
description: How to use webhook from helpers
---

Module `@lilybird/helpers` provides a set of tools for working with a webhook.

## Webhook

### Parse info

You can get information about the Webhook using the url and the `parseDiscordWebhookURL` function. In the example, id is replaced with `WEBHOOK_ID`, and token is replaced with `WEBHOOK_TOKEN`.

```ts showLineNumbers
import { parseDiscordWebhookURL } from "@lilybird/helpers";

/*
{
  branch: "stable",
  version: "default",
  id: "WEBHOOK_ID",
  token: "WEBHOOK_TOKEN",
}
*/
const data = parseDiscordWebhookURL(
  "https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN"
);
```

### Interaction

You can create an instance of `DiscordWebhook` to interact with the webhook - create, edit, or delete messages, or delete the webhook itself.

```ts showLineNumbers
import { REST } from "lilybird";
import { DiscordWebhook } from "@lilybird/helpers";

const dw = new DiscordWebhook(
  new REST(),
  "https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN"
);

// send message with webhook
const msg = await dw.send({
  content: "Hello chat!",
  username: "Lilybird",
});

// get webhook message info. Returns the same data as dw.send
const msgData = await dw.getMessage(msg.id);
console.log(msgData);

// update webhook message
await dw.editMessage(msg.id, {
  content: "Bye chat!",
});

// delete webhook message
await dw.deleteMessage(msg.id);

// delete webhook
await dw.delete("my long reason");
```
