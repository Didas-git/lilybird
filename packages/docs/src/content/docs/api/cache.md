---
title: Cache
description: Learn how to setup caching in lilybird.
sidebar:
  order: 3
---

Caching in lilybird is opt-in and not enabled by default.

When enabling cache you have options to use, for example, and external cache be it your own or even an adapter for something like redis, you can check out [CachingDelegationType](../../documentation/enumerations/cachingdelegationtype) for an explanation for each delegation type.

Currently there are 4 different contents that can be cached by default:

- `self` - If the current user (`client.user`) should listen for changes and auto update. Attaches to:
  - `UserUpdate`
- `guild` - Enable caching guilds. Attaches to:
  - `GuildCreate`
  - `GuildUpdate`
  - `GuildDelete`
- `channel` - Enable caching channels. Attaches to:
  - `ChannelCreate`
  - `ChannelUpdate`
  - `ChannelDelete`
  - Threads:
    - `ThreadCreate`
    - `ThreadUpdate`
    - `ThreadDelete`
- `voiceState` - Enable caching guild voice states (This requires the guild create cache to be enabled). Attaches to:
  - `VoiceStateUpdate`

Other than self you can be selective with how the cache works, for example, you can tell the cache to not listen to delete events so it doesn't delete the entry from the cache.

You can also set an execution policy, in short, this tells the client whether to update the cache before or after your listener has ran.

Here is a small example of how this can be used:

```js
import { 
  CachingDelegationType,
  CacheExecutionPolicy,
  createClient,
  Intents
} from "lilybird";

await createClient({
  token: process.env.TOKEN,
  intents: [Intents.GUILDS],
  caching: {
    delegate: CachingDelegationType.DEFAULT,
    enabled: {
      channel: {
        create: CacheExecutionPolicy.FIRST,
        update: CacheExecutionPolicy.LAST,
        delete: CacheExecutionPolicy.FIRST
      }
    }
  },
  listeners: {
    channelUpdate: async (client, newChannel) => {
      // Because the update cache is only ran after our listener
      // The current cached channel with this id is the old one
      const oldChannel = await client.cache.channels.get(newChannel.id);
      console.log(oldChannel, newChannel);
    }
  }
});
```