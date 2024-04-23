---
title: Setup
description: Lets talk about the setup api.
sidebar:
  order: 1
---

The setup api in lilybird is what allows you to do actions to setup external resources like databases or even publish your commands.

This api exists purely because unlike other frameworks lilybird does not ignore ready events sent after a failed resume attempt or reconnection, and since we don't have real events (we don't use `EventEmitter` or `EventTarget`), we added this api so you can execute certain actions only once at startup.

To learn how you can make use of it we have an example in [one of the guides](/guides/handling-commands).
