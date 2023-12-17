---
title: The Client
description: Learn more about the lilybird client.
---

The exported `createClient` function is in reality just a simple async wrapper for the client class itself, this was done so the user never gets an "incomplete" client.

Because of the field like `user` that the client exposes its impossible to populate said fields before receiving the `Ready` event.

:::caution[Warning]
It is possible to create your own client instance but the types will not account for this and typescript will not warn you about possibly undefined fields.
:::

## The API

```ts
class Client {
  readonly user: User;
  readonly guilds: Array<UnavailableGuildStructure>;
  readonly sessionId: string;
  readonly application: ApplicationStructure;
  readonly rest: REST;

  constructor(
    res: (client: Client) => void,
    options: BaseClientOptions,
    debug?: DebugFunction
  );
  login(token: string): Promise<string>;
  close(): void;
  /** Both numbers are represented in `ms` */
  ping(): Promise<{
    ws: number;
    rest: number;
  }>;
}
```