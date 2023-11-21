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
  - [Attachments](#attachments)
- [Command handling](#command-handling)
  - [The api](#the-api)
- [Contributing](#contributing)

# Installation

```sh
bun add lilybird
```

# Usage

As of now there are no docs so you have to rely on the types to guide you.

If you have any questions/doubts you can open a new issue.

You can find a small test client [here](https://github.com/Didas-git/lilybird-test).

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
jsx = "react-jsx"
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

## Attachments

Attachments work just like [embeds and components](#embeds--components) but they have to be passed to `files` instead of the `attachments` property, this is because the attachments properly is to define whats available to use in your embeds and edits, if you pass an attachment to `files` the library will auto generate the `attachments` property for you.

In short, just pass the `attachments` property if you want to override something.

> **Note**
> Passing a string to `path` is not working properly yet so we highly recommend passing a BunFile

```tsx
const attachment = (
    <Attachment path={Bun.file(join(import.meta.dir, "../shiro.png"))} name="shiro.png" />
);

const embed = (
    <Embed title="Lilybird" description="For bun, with bun">
        <EmbedThumbnail url={`attachment://${attachment.name}`} />
        <EmbedImage url={`attachment://${attachment.name}`} />
    </Embed>
)

await interaction.reply({ embeds: [embed], files: [attachment] })
```

# Command handling

While you can create your own command handler we also provide a command and event handler of our own. It is still in its early stages and will probably change in the future.

## The api

We provide a `Handler` class that you can extend that is responsible for reading and storing the commands and events.

Since some of the functions are async and there are also other limitations regarding listeners we provide a function that generates everything for you and returns the listeners and setup functions that are intended to be injected into the client.

```ts
import {
    createHandler,
    createClient
} from "lilybird";

const listeners = await createHandler({
    // listeners = event listeners
    listeners: `${import.meta.dir}/events`
});

await createClient({
    ..., // your stuff
    ...listeners
});
```

You can check the test client mentioned before to see this in action.

# Contributing

Please refer to the [contributing guide](./CONTRIBUTING.md).