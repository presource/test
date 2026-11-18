import { functionControl } from '@presource/core';
import { within } from 'storybook/test';
import { $memory } from './memory';
import { Screen } from '@testing-library/react';

// Query helper scoped to the CURRENT story's canvas element rather than the whole
// document, so one story's assertions cannot reach another story's DOM.
export const $screen = functionControl(({ key }) => {
    // The canvas the runner passed to this story's play context. Outside a play run
    // `playContext` is still null, so destructuring it throws here.
    const { canvasElement } = $memory().playContext?.context!;

    const screen: any = within(canvasElement);

    // Prefer the testing-library query for that key (findByRole, findByText, ...),
    // falling back to a member of the canvas element itself (querySelector, focus,
    // ...); both branches are bound so `this` survives destructuring. An unknown key
    // resolves to undefined.
    return screen[key]?.bind(screen) || (canvasElement as any)[key]?.bind(canvasElement);
}) as Screen & HTMLElement;
