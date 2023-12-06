---
title: Application Commands
description: How to use lilybird's ApplicationCommand component.
---

## Slash Commands

Creating slash commands with lilybird's jsx components is a trivial task, you can create one with the parent element `ApplicationCommand` and add options by importing the respective `<type>Option`.

```tsx title="doc-command.tsx"
import { ApplicationCommand, StringOption, UserOption } from "@lilybird/jsx";

const command = (
  <ApplicationCommand name="docs" description="Search at docs">
    <StringOption name="query" description="Select query" required />
    <UserOption name="target" description="User to mention" />
  </ApplicationCommand>
);
```

:::note
The above code was taken from the [bun discord bot](https://github.com/xHyroM/bun-discord-bot) as they have been a huge help in this project.
:::