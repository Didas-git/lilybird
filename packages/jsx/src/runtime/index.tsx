// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace JSX {
    interface ElementChildrenAttribute {
        children: Record<string, unknown>;
    }
}

export const jsxs = jsx;

export function jsx(component: Component, props: { children: Array<any>, [x: string]: any }): any {
    return component(props);
}

export function jsxDEV(component: Component, props: { children: Array<any>, [x: string]: any }): any {
    console.log("Parsing JSX props:", props);
    return component(props);
}

type Component = (props: unknown) => any;
