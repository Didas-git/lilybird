---
title: Builders
description: How to use builders from helpers
---

Module `@lilybird/helpers` provides a set of builders similar in syntax to other popular discord libraries for JS.

## Command

Allows you to create a basic template for further transmission to handler or for use in REST.

```ts showLineNumbers
import {
  ApplicationCommandBuilder,
  StringOptionBuilder,
  SubCommandBuilder,
} from "@lilybird/helpers/builders";
import { ApplicationCommandOptionType } from "lilybird";

const baseCommand = new ApplicationCommandBuilder()
  .name("test")
  .description("Run test command")
  .toJSON();

// all option builders: BaseOptionBuilder, StringOptionBuilder, NumericOptionBuilder,
const strOption = new StringOptionBuilder()
  .name("query")
  .description("Insert a query")
  .toJSON();

// use SUB_COMMAND for create sub command or SUB_COMMAND_GROUP for sub command group
const subCommand = new SubCommandBuilder(ApplicationCommandOptionType.SUB_COMMAND)
  .name("sub")
  .description("lets test this sub command")
  .toJSON();
```

## Embed

Allows you to create a embed with class builder.

```ts showLineNumbers
import { EmbedBuilder } from "@lilybird/helpers/builders";

const embed = new EmbedBuilder()
  .title("Hello world")
  .description("How are you?")
  .footer({
    text: "Built with Lilybird",
  })
  .toJSON();
```

## Poll

Allows you to create a poll with class builder.

```ts showLineNumbers
import { PollAnswerBuilder, PollBuilder } from "@lilybird/helpers/builders";

const answers = [
  new PollAnswerBuilder()
    .media({
      text: "yes",
    })
    .toJSON(),
  new PollAnswerBuilder()
    .media({
      text: "maybe",
    })
    .toJSON(),
];

const poll = new PollBuilder()
  .question()
  .duration(1) // in hours (1 - 168)
  .setAnswers(...answers)
  .toJSON();
```
