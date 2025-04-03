---
title: Localization
description: Learn how to localize commands with Lilybird.
---

:::note
This guide uses TypeScript and Advanced handlers for all the examples, if you are using JavaScript you should adapt accordingly.
:::

Localization is available for names and descriptions of commands, subcommands, and options, as well as the names of choices, by submitting the appropriate `name_localizations` and `description_localizations` fields when creating the application command.

You don't have to add localization for [all available languages](https://discord.com/developers/docs/reference#locales). If you do not add localization for the language, `name` or `description` will be used instead.

Let's add localization of the command into several languages.

```ts showLineNumbers title="commands/image.ts" collapse={1-3, 15-27}
import { InteractionCallbackType } from "lilybird";
import { $applicationCommand } from "@lilybird/handlers/advanced";

$applicationCommand({
  name: "image",
  name_localizations: {
    ru: "картинка",
    de: "bild",
  },
  description: "Get a random pet picture",
  description_localizations: {
    ru: "Получи рандомную картинку с питомцем",
    de: "Erhalte ein zufälliges Haustierbild",
  },
  handle: async (client, interaction) => {
    await client.rest.createInteractionResponse(
      interaction.id,
      interaction.token,
      {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Your image",
        },
      },
      [{ file: Bun.file("/path/to/pet.png"), name: "pet.png" }]
    );
  },
});
```

You can localize sub commands in the same way.

## Command Options

As mentioned above, you can also localize the options for commands.

Let's add localized options to our command.

```ts showLineNumbers title="commands/image.ts" collapse={1-14, 38-53, 57-71}
import { InteractionCallbackType } from "lilybird";
import { $applicationCommand } from "@lilybird/handlers/advanced";

$applicationCommand({
  name: "image",
  name_localizations: {
    ru: "картинка",
    de: "bild",
  },
  description: "Get a random pet picture",
  description_localizations: {
    ru: "Получи рандомную картинку с питомцем",
    de: "Erhalte ein zufälliges Haustierbild",
  },
  options: [
    {
      type: ApplicationCommandOptionType.STRING,
      name: "pet",
      name_localizations: {
        ru: "питомец",
        de: "haustier",
      },
      description: "Choose a pet",
      description_localizations: {
        ru: "Выбери питомца",
        de: "Wähle ein Haustier",
      },
      required: true,
      choices: [
        {
          name: "fox",
          value: "fox",
          name_localizations: {
            ru: "лиса",
            de: "fuchs",
          },
        },
        {
          name: "cat",
          value: "cat",
          name_localizations: {
            ru: "кот",
            de: "katze",
          },
        },
        {
          name: "dog",
          value: "dog",
          name_localizations: {
            ru: "собака",
            de: "hund",
          },
        },
      ],
    },
  ],
  handle: async (client, interaction) => {
    const pet = interaction.data.options?.[0].value ?? "unknown";
    await client.rest.createInteractionResponse(
      interaction.id,
      interaction.token,
      {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Your ${pet} image`,
        },
      },
      [{ file: Bun.file("/path/to/pet.png"), name: "pet.png" }]
    );
  },
});
```

### With JSX

JSX also allows localization, let's change the options field to an option using JSX.

```ts showLineNumbers title="commands/image.tsx" collapse={1-2, 4-15, 38-53, 56-70}
import { InteractionCallbackType } from "lilybird";
import { $applicationCommand } from "@lilybird/handlers/advanced";
import { StringOption, CommandOptions } from "@lilybird/jsx";

$applicationCommand({
  name: "image",
  name_localizations: {
    ru: "картинка",
    de: "bild",
  },
  description: "Get a random pet picture",
  description_localizations: {
    ru: "Получи рандомную картинку с питомцем",
    de: "Erhalte ein zufälliges Haustierbild",
  },
  options: [
    <StringOption
      name="pet"
      name_localizations={{
        ru: "питомец",
        de: "haustier",
      }}
      description="Choose a pet"
      description_localizations={{
        ru: "Выбери питомца",
        de: "Wähle ein Haustier",
      }}
      required
    >
      <CommandOptions
        name="fox"
        value="fox"
        name_localizations={{
          ru: "лиса",
          de: "fuchs",
        }}
      />
      <CommandOptions
        name="cat"
        value="cat"
        name_localizations={{
          ru: "кот",
          de: "katze",
        }}
      />
      <CommandOptions
        name="dog"
        value="dog"
        name_localizations={{
          ru: "собака",
          de: "hund",
        }}
      />
    </StringOption>,
  ],
  handle: async (client, interaction) => {
    const pet = interaction.data.options?.[0].value ?? "unknown";
    await client.rest.createInteractionResponse(
      interaction.id,
      interaction.token,
      {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Your ${pet} image`,
        },
      },
      [{ file: Bun.file("/path/to/pet.png"), name: "pet.png" }]
    );
  },
});
```

## Localized responses

You can also localize responses for commands. In this case, you will need to create an object with the responses and set a standard value using the Nullish coalescing operator (`??`).

:::caution
Note that all users will see the message in the language of the user who sent the command.
:::

```ts showLineNumbers title="commands/image.ts" collapse={1-3, 9-19, 22-24, 31-32, 34}
import { InteractionCallbackType, Locale } from "lilybird";
import { $applicationCommand } from "@lilybird/handlers/advanced";

const responses: Partial<Record<Locale, string>> = {
  ru: "Ваша картинка",
  de: "Ihr Bild",
};

$applicationCommand({
  name: "image",
  name_localizations: {
    ru: "картинка",
    de: "bild",
  },
  description: "Get a random pet picture",
  description_localizations: {
    ru: "Получи рандомную картинку с питомцем",
    de: "Erhalte ein zufälliges Haustierbild",
  },
  handle: async (client, interaction) => {
    const content = responses[interaction.locale] ?? "Your image";
    await client.rest.createInteractionResponse(
      interaction.id,
      interaction.token,
      {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content,
        },
      },
      [{ file: Bun.file("pet.png"), name: "pet.png" }]
    );
  },
});
```
