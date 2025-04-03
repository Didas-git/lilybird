
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
    matcher?: [name: string, fn: MessageComponentHandler];
}

export type MessageComponentHandler = (interaction: TransformedInteraction<MessageComponentData, TransformedMessage>) => Awaitable<unknown>;

export interface ComponentStructure {
    type: Exclude<ComponentType, ComponentType.ActionRow>;
    id: string;
    customMatcher?: string | MessageComponentHandler;
    handle: MessageComponentHandler;
}

export interface DynamicComponentStructure {
    filter: (interaction: TransformedInteraction<MessageComponentData, TransformedMessage>) => Awaitable<boolean>;
    handle: MessageComponentHandler;
    timeout?: number;
}

export class MessageComponentStore {
    readonly #stacks = new Map<Exclude<ComponentType, ComponentType.ActionRow>, Map<string, CompiledComponent>>();
    readonly #store = new Map<number, DynamicComponentStructure>();
    readonly #emit?: HandlerListener;

    #attachDynamicComponentListener: boolean = false;

    public constructor(handlerListener?: HandlerListener, attachDynamicComponentListener?: boolean) {
        this.#emit = handlerListener;

        if (attachDynamicComponentListener) this.#attachDynamicComponentListener = attachDynamicComponentListener;
    }

    public addDynamicComponent(component: DynamicComponentStructure): void {
        if (!this.#attachDynamicComponentListener) throw new Error("Dynamic Components are disabled, please enable them before using this feature.");
        this.#store.set(Date.now(), component);
    }

    public storeComponent(component: ComponentStructure): void {
        const { type, id, customMatcher, handle } = component;
        const fnName = `component_${id.replace("-", "_")}`;
        const componentStack = this.#stacks.get(type);

        const obj: CompiledComponent = {
            body: `if (custom_id === "${id}") { return ${fnName}(t_int) }`,
            handler: [fnName, handle],
            matcher: undefined
        };

        if (typeof customMatcher === "function") {
            const matchFnName = `match_id_${id}`;
            obj.body = `if (${matchFnName}(t_int)) { return ${fnName}(t_int) }`;
            obj.matcher = [matchFnName, customMatcher];
        } else if (typeof customMatcher === "string")
            obj.body = `if (${customMatcher}) { return ${fnName}(t_int) }`;

        if (typeof componentStack === "undefined") {
            this.#stacks.set(type, new Map([[id, obj]]));
            return;
        }

        obj.body = `else ${obj.body}`;
        componentStack.set(id, obj);
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
            `if (interaction.type === ${InteractionType.MESSAGE_COMPONENT}) {`,
            "const t_int = transformer(client, interaction);"
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
                if (typeof component.matcher !== "undefined") {
                    const [nn, hh] = component.matcher;
                    functions.set(nn, hh);
                }
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
        let extendedStack = stack;

        if (this.#attachDynamicComponentListener) {
            extendedStack += `\nfor (let i = 0, entries = [..._store.entries()], { length } = entries; i < length; i++) {
    const [date, data] = entries[i];

    const { timeout, filter, handle } = data;
    if (typeof timeout === "number" && Date.now() - date <= timeout) {
        this.#store.delete(date);
        continue;
    }

    const _int = transformer(client, interaction);
    if (!filter(_int)) continue;
    await handle(int);
}`;
        }

        this.#emit?.(HandlerIdentifier.COMPILED, extendedStack);

        const init = this.#attachDynamicComponentListener ? ["_store", "transformers"] : ["transformers"];
        const initArgs = this.#attachDynamicComponentListener ? [this.#store, defaultTransformers.interactionCreate.handler] : [defaultTransformers.interactionCreate.handler];
        // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
        return new Function(
            ...init,
            ...functionNames,
            `return async (client, interaction) => { ${extendedStack} }`
        )(
            ...initArgs,
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

    public set attachDynamicComponentListener(bool: boolean) {
        this.#attachDynamicComponentListener = bool;
    }

    public get attachDynamicComponentListener(): boolean {
        return this.#attachDynamicComponentListener;
    }
}
