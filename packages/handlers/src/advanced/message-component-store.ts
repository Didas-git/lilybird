
import { defaultTransformers } from "@lilybird/transformers";
import { ComponentType, InteractionType } from "lilybird";
import { HandlerIdentifier } from "./shared.js";

import type { Awaitable, Client, Interaction } from "lilybird";
import type { HandlerListener } from "./shared.js";

import type {
    Interaction as TransformedInteraction,
    Message as TransformedMessage,
    MessageComponentData
} from "@lilybird/transformers";

interface CompiledComponent {
    body: string;
    handler: [name: string, fn: MessageComponentHandler];
}

export type MessageComponentHandler = (interaction: TransformedInteraction<MessageComponentData, TransformedMessage>) => Awaitable<unknown>;

export type ComponentStructure = {
    type: Exclude<ComponentType, ComponentType.ActionRow>,
    id: string,
    handle: MessageComponentHandler
};
export class MessageComponentStore {
    readonly #stacks = new Map<Exclude<ComponentType, ComponentType.ActionRow>, Map<string, CompiledComponent>>();

    readonly #emit?: HandlerListener;

    public constructor(handlerListener?: HandlerListener) {
        this.#emit = handlerListener;
    }

    public storeComponent(component: ComponentStructure): void {
        const { type, id, handle } = component;

        const fnName = `component_${id.replace("-", "_")}`;

        const componentStack = this.#stacks.get(type);
        if (typeof componentStack === "undefined") {
            this.#stacks.set(type, new Map([[id, { body: `if (custom_id === "${id}") {${fnName}(transformer(client, interaction))}`, handler: [fnName, handle] } ]]));
            return;
        }

        componentStack.set(id, { body: `else if (custom_id === "${id}") {${fnName}(transformer(client, interaction))}`, handler: [fnName, handle] });
    }

    public getCompilationStack(): {
        functionNames: IterableIterator<string>,
        handlers: IterableIterator<(...args: any) => any>,
        stack: string
    } | null {
        if (this.#stacks.size === 0) return null;

        const functions = new Map<string, MessageComponentHandler>();
        const stackEntries = [...this.#stacks.entries()];

        const componentStack: Array<string> = [
            "const custom_id = interaction.data.custom_id;",
            `if (interaction.type === ${InteractionType.MESSAGE_COMPONENT}) {`
        ];

        const modalStack: Array<string> = [`else if (interaction.type === "${InteractionType.MODAL_SUBMIT}") {`];

        for (let i = 0, { length } = stackEntries; i < length; i++) {
            const [stringType, stack] = stackEntries[i];
            const stackValues = [...stack.values()];
            const stackBody: Array<string> = [];

            for (let j = 0, len = stackValues.length; j < len; j++) {
                const component = stackValues[j];
                const [n, h] = component.handler;
                functions.set(n, h);
                stackBody.push(component.body);
            }

            if ((<ComponentType>+stringType) === ComponentType.TextInput) modalStack.push(stackBody.join(""));
            else componentStack.push(stackBody.join(""));
        }

        const arr: Array<string> = [];
        if (componentStack.length > 1) arr.push(componentStack.join(""), "}");
        if (modalStack.length > 1) {
            if (arr.length === 0) modalStack[0] = modalStack[0].slice(5);
            arr.push(modalStack.join(""), "}");
        }

        if (arr.length === 0) return null;

        const fNames = functions.keys();
        const fHandlers = functions.values();
        const compiledListener = arr.join("");

        return {
            functionNames: fNames,
            handlers: fHandlers,
            stack: compiledListener
        };
    }

    public compile(): ((client: Client, interaction: Interaction.Structure) => Awaitable<unknown>) | null {
        const compiledResult = this.getCompilationStack();
        if (compiledResult === null) return null;

        const { stack, functionNames, handlers } = compiledResult;
        this.#emit?.(HandlerIdentifier.COMPILED, stack);

        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        return new Function(
            "transformer",
            ...functionNames,
            `return async (client, interaction) => { ${stack} }`
        )(
            defaultTransformers.interactionCreate.handler,
            ...handlers
        ) as never;
    }

    public getStoredComponents(): Record<ComponentType, Array<CompiledComponent>> {
        const mainEntries = [...this.#stacks.entries()];
        const obj: Record<ComponentType, Array<CompiledComponent>> = <never>{};

        for (let i = 0, { length } = mainEntries; i < length; i++) {
            const [key, value] = mainEntries[i];
            obj[key] = [...value.values()];
        }

        return obj;
    }

    public clear(): void {
        this.#stacks.clear();
    }
}
