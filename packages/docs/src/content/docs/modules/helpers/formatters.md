---
title: Formatters
description: How to use markdown helpers
---

Module `@lilybird/helpers` provides a convenient set of functions for formatting your messages.

## Markdown

This module provides formatters for all markdown styles supported by Discord.

```ts showLineNumbers
import {
  italic,
  bold,
  boldItalic,
  underline,
  strikeThrough,
  spoiler,
  subText,
  quote,
  header,
  maskedURL,
  unorderedList,
  block,
  codeBlock,
  parseCodeBlock,
  suppressLinkEmbed,
} from "@lilybird/helpers";

const content = "Lilybird";
const link = "https://github.com/Didas-git/lilybird";
const code = "console.log('Hello Lilybird!');";
const list = ["discord", "bun", ["lilybird", ["you"]]];

// _Lilybird_
const italicContent = italic(content);

// **Lilybird**
const boldContent = bold(content);

// ***Lilybird***
const boldItalicContent = boldItalic(content);

// __Lilybird__
const underlineContent = underline(content);

// ~~Lilybird~~
const strikeThroughContent = strikeThrough(content);

// ||Lilybird||
const spoilerContent = spoiler(content);

// -# Lilybird
const subTextContent = subText(content);

// > Lilybird
const quoteContent = quote(content);

// >>> Lilybird
const multiLineQuoteContent = quote(content, true);

// # Lilybird
const headerFirstLvlContent = header(content);

// ## Lilybird
const headerSecondLvlContent = header(content, 2);

// ### Lilybird
const headerThirdLvlContent = header(content, 3);

// [Lilybird](https://github.com/Didas-git/lilybird)
const maskedUrlContent = maskedURL(content, link);

/*
- discord
- bun
  - lilybird
    - you
*/
const unorderedListContent = unorderedList(list);

/*
added 2 extra spaces to list

  - discord
  - bun
    - lilybird
      - you
*/
const unorderedFlatListContent = unorderedList(list, 2);

// `console.log('Hello Lilybird!');`
const blockContent = block(code);

/*
provides without '\'

\`\`\`ts
console.log('Hello Lilybird!');
\`\`\`
*/
const codeBlockContent = codeBlock(code, "ts");

/*
{
  language: "ts",
  body: "console.log('Hello Lilybird!');\n",
}
*/
const parsedCodeBlock = parseCodeBlock(codeBlockContent);

// <https://github.com/Didas-git/lilybird>
const supressedEmbedLinkContent = suppressLinkEmbed(link);
```

## Mentions

Easily mention a user, channel, role, or bot command. All Guild Navigation Types are available in the [Discord API documentation](https://discord.com/developers/docs/reference#message-formatting-guild-navigation-types).

```ts showLineNumbers
import {
  formatChannel,
  formatChatInputCommand,
  formatGuildNavigation,
  formatRole,
  formatUser,
  GuildNavigationType,
} from "@lilybird/helpers";

const id = "551653500216672256";
const name = "test";
const sub = "settings";
// <@551653500216672256>
const user = formatUser(id);

// <#551653500216672256>
const channel = formatChannel(id);

const;

// <@&551653500216672256>
const role = formatRole(id);

// </test:551653500216672256>
const command = formatChatInputCommand(id, name);

// </test settings:551653500216672256>
const subcommand = formatChatInputCommand(id, name, sub);

// </test owner settings:551653500216672256>
const subGroupCommand = formatChatInputCommand(id, name, sub, "owner");

// <id:guide>
const serverGuide = formatGuildNavigation(GuildNavigationType.Guide);

// <id:linked-roles:551653500216672256>
const linkedRoles = formatGuildNavigation(
  GuildNavigationType.LinkedRoles,
  id // roleId
);
```

## Timestamp

Easily format the timestamp using the `formatTimestamp` function, which accepts a string, number, or Date object as input. All available Timestamp Styles can be found in the [Discord API documentation](https://discord.com/developers/docs/reference#message-formatting-timestamp-styles).

```ts showLineNumbers
import { formatTimestamp, TimestampStyle } from "@lilybird/helpers";
const date = new Date();
// or
// const date = Math.floor(Date.now() / 1000);
// or
// const date = "1742578900";

// <t:1742578900:f>
const time = formatTimestamp(date);
// <t:1742578900:R>
const relative = formatTimestamp(date, TimestampStyle.RelativeTime);
```

## Emoji

Easily format a static or animated custom emoji using the `formatCustomEmoji` function.

```ts showLineNumbers
import { formatCustomEmoji } from "@lilybird/helpers";

const id = "868478604365922314";
const name = "github";

// <:github:${id}>
const emojiString = formatCustomEmoji(name, id);

// <a:github:${id}>
const animEmojiString = formatCustomEmoji(name, id, true);
```
