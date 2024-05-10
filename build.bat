@echo off

:: Run 'bun i --frozen-lockfile'
bun i --frozen-lockfile

:: Building lilybird core
echo Building lilybird core
cd packages\core
bun run build

:: Building lilybird transformers module
echo Building lilybird transformers module
cd ..\transformers
bun run build

:: Building lilybird handlers module
echo Building lilybird handlers module
cd ..\handlers
bun run build

:: Building lilybird redis module
echo Building lilybird redis module
cd ..\redis
bun run build

:: Building lilybird jsx module
echo Building lilybird jsx module
cd ..\jsx
bun run build

:: Building lilybird helpers module
echo Building lilybird helpers module
cd ..\helpers
bun run build

:: Building create-bot package
echo Building create-bot package
cd ..\create
bun run build

:: Running ESLint on all packages
echo Running ESLint on all packages
cd ..\..
bun check
