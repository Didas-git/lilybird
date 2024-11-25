---
title: Application Commands
description: How to use lilybird's ApplicationCommand component.
sidebar:
  order: 1
---

## Slash Commands

Creating slash commands with Lilybird's JSX components is a trivial task. You can create one with the parent element `ApplicationCommand` and add options by importing the respective `<type>Option`.

```tsx title="doc-command.tsx"
import { ApplicationCommand, StringOption, UserOption } from "@lilybird/jsx";

const command = (
  <ApplicationCommand name="docs" description="Search the docs">
    <StringOption name="query" description="Select query" required />
    <UserOption name="target" description="User to mention" />
  </ApplicationCommand>
);
```

:::note
The above code was taken from the [Bun Discord bot](https://github.com/xHyroM/bun-discord-bot) as they have been a huge help in this project.
:::