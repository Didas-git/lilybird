import type { DefaultTransformers } from "@lilybird/transformers";
import type { Awaitable, ClientListeners } from "lilybird";

export interface Event<
    E extends keyof ClientListeners<DefaultTransformers> = keyof ClientListeners<DefaultTransformers>,
    T extends Required<ClientListeners<DefaultTransformers>> = Required<ClientListeners<DefaultTransformers>>
> {
    name?: string;
    event: E;
    run: (...args: Parameters<T[E]>) => Awaitable<any>;
}
