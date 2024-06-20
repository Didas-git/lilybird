---
title: Coloring
description: Learn the ways you can color embeds and text in discord using lilybird.
sidebar:
  order: 4
---

In discord, customization of colors and specific accents is allowed in a limited set of places: Embed accents and ANSI Blocks.

## Coloring embeds

Discord requires us to pass a base 10 number when trying to modify any of these, but that's pretty unintuitive given the RGB standard.
The proposal is instead to write the number in base 16 and prepend each number with a simple `0x`, as shown below.

```diff lang=js
- const color = "#ad9ee7";
+ const color = 0xad9ee7; // or just 11378407
```

Alternatively, you could write it out as a string codifying the RGB value you wish to pass.

```ts showLineNumbers
export function hexColorToNumber(color: string): number {
  return parseInt(color.replace("#", ""), 16);
}

const color = hexColorToNumber("#ad9ee7"); // 11378407
```

## Coloring messages

Coloring messages in discord can be achieved by using ANSI Code Blocks, for ease of use we recommend using a coloring library, but, if you want a complete tutorial on using ANSI code we cover this further down.

:::caution[Warning]
Discord has limited support for ansi codes and colors, so libraries that use `8bit`, `24bit` colors and other codes won't work, and even bright `4bit` colors do not work. 
:::

### Using a library (Tasai)

There are multiple libraries to help with this process, the ones we recommend are either [`Tasai`](https://github.com/Didas-git/tasai) or [`ansi-colors`](https://github.com/doowb/ansi-colors), we will be using tasai on our examples.

```diff lang=ts showLineNumbers collapse={3-13, 16-20}
import { t } from "tasai";

import {
  createClient,
  Intents
} from "lilybird";

await createClient({
  token: process.env.TOKEN,
  intents: [Intents.GUILDS],
  listeners: {
    messageCreate: async (client, message) => {
      await client.rest.createMessage(message.channel_id, { 
-        content: "Hii~",
+        content: `\`\`\`ansi\n${t.red.colorize("Hii~")}\n\`\`\``,
        message_reference: { message_id: message.id }
      });
    }
  }
});
```

### Making your own helper

:::danger[Be aware]
This is a more advanced tutorial, if you are having trouble understanding it we highly advise that you use a library.
:::

Writing your own ANSI helper is rather easy, but, for the sake of simplification we are only going to be going over [`ESC[n m`](https://en.wikipedia.org/wiki/ANSI_escape_code#CSI_(Control_Sequence_Introducer)_sequences) for [`SGR`](https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_(Select_Graphic_Rendition)_parameters) mode, because its pretty much the only mode discord supports.

We will also be using the following `SGR` codes:
- `30` through `37` for foreground colors.
- `40` through `47` for background colors.
- `39` and `49` as reset codes for said colors.

```ts
function colorizeWith4Bit(string: string, code: number): string {
  // We do this check first to avoid duplication
  const isBackgroundColor = code >= 40 && code <= 47;

  // Is the code a valid 4bit ascii color
  if (!(code >= 30 && code <= 37) || !isBackgroundColor) return;

  /*
    The `ESC` in ANSI represents byte 27,
    there are a few ways to write this like `\e`, `\033`, `\u001b` and `\x1b`
    we chose `x1b` because it is the most portable among them.
  */
  return `\x1B[${code}m${string}\x1B[${isBackgroundColor ? 49 : 39}m`;
}

const redText = colorizeWith4Bit("Hii~", 31);
```
