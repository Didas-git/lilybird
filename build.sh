#! /usr/bin/bash

bun i --frozen-lockfile

echo Building lilybird core
cd packages/core
bun run build

echo Building lilybird transformers module
cd ../transformers
bun run build

echo Building lilybird handlers module
cd ../handlers
bun run build

echo Building lilybird redis module
cd ../redis
bun run build

echo Building lilybird jsx module
cd ../jsx
bun run build


echo Building create-bot package
cd ../create
bun run build

echo Running ESLint on all packages
cd ../..
bun check
