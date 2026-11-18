import { useRef, useState } from 'react';
import { objectProxy } from '@presource/core';

// Shallow props reactivity, local to @presource/test.
//
// This mirrors `propsReactive` from `@presource/react`
// (src/utilities/props/reactive.ts) instead of importing it: `@presource/react`'s
// tests and stories import `@presource/test`, so importing `@presource/react`
// here made the two workspace packages depend on each other. Only the `set`
// operation is intercepted — reading a prop does not trigger a re-render, and
// only writing to the returned proxy does.

export type PropsReactive = <T extends { [key: string]: any }>(input: T) => T;

export const propsReactive: PropsReactive = (changeableProps) => {
    const [_, refresh] = useState({});

    // The ref always holds the latest props, so updates survive the re-render.
    const propsRef = useRef(changeableProps);

    return objectProxy(propsRef.current, {
        set: ({ key, value }) => {
            propsRef.current = { ...propsRef.current, [key]: value };

            // Tell the consuming component to refresh.
            refresh({});
            return true;
        }
    });
};
