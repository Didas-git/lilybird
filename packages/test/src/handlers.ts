import { makeTransformersObject } from "@lilybird/transformers";
import { Handler } from "@lilybird/handlers";

import type { MergeTransformers } from "@lilybird/transformers";
import type { Client } from "lilybird";

export const defaultTransformers = makeTransformersObject();

export const handler = new Handler<MergeTransformers<Client, typeof defaultTransformers>, true>({ transformers: defaultTransformers });
export const $applicationCommand = handler.storeCommand.bind(handler);
export const $listener = handler.storeListener.bind(handler);
export const $component = handler.buttonCollector.bind(handler);
