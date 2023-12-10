---
title: Receiving Application Commands
description: How to receive commands using lilybird.
---

Interactions work similarly to other frameworks out there so they should be fairly easy to grasp.

## Receiving and replying to commands

The interaction structure is identical to the one documented by [discord](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object).
The difference is that we provide helper methods like `inGuild` and `isApplicationCommandInteraction` so you can narrow down interaction types and always know the shape of your data.

```ts
await createClient({
  ...,
  listeners: {
    async interactionCreate(interaction) {
      if (interaction.isApplicationCommandInteraction()) {
        if (interaction.data.name === "ping") {
          await interaction.reply("PONG");
          return;
        }
      }
    }
  }
});
```

## Deferring a reply

Deferring interactions can be done by simply calling `deferReply()`, which optionally accepts a boolean to make it ephemeral.

```ts
await interaction.deferReply();
```

## Ephemeral replies

Making ephemeral responses is extremely simple and all you need to do is pass the option to the reply method.

```ts ins="{ ephemeral: true }"
await createClient({
  ...,
  listeners: {
    async interactionCreate(interaction) {
      if (interaction.isApplicationCommandInteraction()) {
        if (interaction.data.name === "ping") {
          await interaction.reply("PONG", { ephemeral: true });
          return;
        }
      }
    }
  }
});
```

## Autocomplete Interactions

Auto complete interactions can be worked with in a similar way, the difference is that instead of replying to the interaction you respond with choices.

```ts
await createClient({
  ...,
  listeners: {
    async interactionCreate(interaction) {
      if (interaction.isAutocompleteInteraction()) {
        if (interaction.data.getFocused().name === "some-command") {
          await interaction.respond([
            { name: "first", value: 1 },
            { name: "second", value: 2 }
          ]);
          return;
        }
      }
    }
  }
});
```