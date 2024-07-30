# Contributing to lilybird

> **Note**
> Is recommended that you have some degree of typescript knowledge to contribute to the library

# Setup

- Clone the repository.
- Run `bun i --frozen-lockfile`.
- Run `bun run build`.
- Move into the packages you want to change.

# Building and testing

- To build the package you can run `bun run build` on the package you modified or use the filtered options on the root folder.
- Usually you will also need to restart the typescript server so you don't have errors on the IDE.
- There is a [test bot](./packages/test) that you can use as template to test the changes.