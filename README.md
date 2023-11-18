# About

A bun-first discord client written in TS that focus on performance and UX

> **Warning**
> The library is under active  development, breaking changes are to be expected so use it at your own risk

# Table of contents

- [About](#about)
- [Table of contents](#table-of-contents)
- [Installation](#installation)
- [Usage](#usage)
  - [Connecting](#connecting)
  - [Listening to events](#listening-to-events)
  - [Embeds \& Components](#embeds--components)
    - [JSX](#jsx)
      - [Setup](#setup)
      - [Usage](#usage-1)
    - [Crude](#crude)
    - [Future Plans](#future-plans)

# Installation

```sh
bun add lilybird
```

# Usage

As of now there are no docs so you have to rely on the types to guide you.

If you have any questions/doubts you can open a new issue.

## Connecting

```ts
import { createClient, Intents } from "lilybird";

await createClient({
    token: your_token,
    intents: [Intents.GUILDS]
});
```

## Listening to events

Listeners can be `async` and the client should properly handle it.

```ts
await createClient({
    ...
    listeners: {
        ready() {
            console.log("Connected!");
        }
    }
});
```

## Embeds & Components

Currently there are 2 available methods to create this objects.

### JSX

The library comes with some components to be used with `react-jsx`.

#### Setup

Its really simple to setup jsx, there are 3 ways of doing this with bun:

- Using `tsconfig.json` or `jsconfig.json`
  - Add the following to your `compilerOptions`
  
```json
"jsx": "react-jsx",
"jsxImportSource": "lilybird"
```

- Using `bunfig.toml`
  - Add the following

```toml
jsx = "react-jsx",
jsxImportSource = "lilybird"
```

For more information you can check the [bun website](https://bun.sh/docs/runtime/jsx) and the [typescript handbook](https://www.typescriptlang.org/docs/handbook/jsx.html).

#### Usage

```tsx
import {
    EmbedFooter,
    EmbedField,
    Embed
} from "lilybird";

const embed = (
    <Embed title="Hello from TSX" color={0xff00ef} timestamp>
        {Array.from({ length: 4 }, (_, i) => (
            <EmbedField name={`Field ${i}`} value="bun" inline />
        ))}
        <EmbedFooter text="Hello from bun" />
    </Embed>
);
```

### Crude

Its just as it sounds, just plain old JS objects.

### Future Plans

There are plans to add a builder like djs for this but that will sit on the backlog for a moment since there are other priorities, if you want to contribute you can open a pr for this.