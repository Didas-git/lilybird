---
title: Embeds
description: How to use lilybird's Embed components.
---

## Creating embeds

Embeds can easily be created using the main `Embed` component, for properties of the embed you can use the `Embed<x>` versions of said properties.

```tsx
<Embed title="Hello from Lilybird TSX" color={0xff00ef} timestamp>
  {Array.from({ length: 4 }, (_, i) => (
    <EmbedField name={`Field ${i}`} value="bun" inline />
  ))}
  <EmbedFooter text="Lilybird" />
</Embed>
```