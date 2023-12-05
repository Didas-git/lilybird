#! /usr/bin/bash

bun i

echo Building lilybird core
cd packages/core
bun run build

echo Building lilybird jsx module
cd ../jsx
bun run build

echo Building lilybird handlers module
cd ../handlers
bun run build

echo Building create-bot package
cd ../create
bun run build