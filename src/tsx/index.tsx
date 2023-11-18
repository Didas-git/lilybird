/* eslint-disable @typescript-eslint/naming-convention */
export declare namespace JSX {
    interface ElementChildrenAttribute {
        children: {};
    }
}

export const jsxs = jsx;

export function jsx(component: Component, props: { children: Array<any>, [x: string]: any }): any {
    return component(props);
}

type Component = (props: unknown) => any;