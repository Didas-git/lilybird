---
title: Message Components
description: How to use lilybird's message components.
---

The building block of all message components is the `ActionRow` component.
It wraps all the other components and exists exactly just for that reason.

All of the components have all the properties that discord allows and they are really simple to use.

Discord reference: [Message Components](https://discord.com/developers/docs/interactions/message-components)

## Buttons

Buttons are the simplest and most used component type, lilybird makes their usage even more trivial.

```tsx
import { ActionRow, Button } from "@lilybird/jsx";
import { ButtonStyle } from "lilybird";

const buttonRow = (
  <ActionRow>
    <Button id="success-btn" label="Click Me" style={ButtonStyle.Primary}/>
  </ActionRow>
);
```

### Link Buttons

Like the discord docs say, a link button cannot have a `custom_id` so instead we use the `url` property.

```diff lang="tsx"
import { ActionRow, Button } from "@lilybird/jsx";
import { ButtonStyle } from "lilybird";

const buttonRow = (
  <ActionRow>
-    <Button id="success-btn" label="Click Me" style={ButtonStyle.Primary}/>
+    <Button url="https://lilybird.didas.dev" label="Click Me" style={ButtonStyle.Link}/>
  </ActionRow>
);
```

## Select Menus

Select menus with components are just as easy to use and they are named as `<type>SelectMenu`.

```tsx
import { ActionRow, RoleSelectMenu } from "@lilybird/jsx";

const selectRow = (
  <ActionRow>
    <RoleSelectMenu id="role-selector"/>
  </ActionRow>
);
```

## Modals

Modals might be more daunting at first sight but they are really simple specially when using JSX components for them.

```tsx
import { TextInputModal } from "@lilybird/jsx";
import { TextInputStyle } from "lilybird";

const modal = <TextInputModal id="my-modal" label="Name" style={TextInputStyle.Short}/>;
```