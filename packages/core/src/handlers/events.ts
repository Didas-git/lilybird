import type { Awaitable, ClientEventListeners } from "..";

export interface Event<
    E extends keyof ClientEventListeners = keyof ClientEventListeners,
    T extends Required<ClientEventListeners> = Required<ClientEventListeners>
> {
    name?: string;
    event: E;
    run: (...args: Parameters<T[E]>) => Awaitable<any>;
}