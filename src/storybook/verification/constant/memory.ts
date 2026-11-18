import { functionControl } from '@presource/core';
import { Meta, ReactRenderer, StoryObj } from '@storybook/react';
import { PlayFunction, StoryContext } from 'storybook/internal/types';

// Everything the verification helpers need about the story that is currently being
// built or run. Module-level, so one instance per module graph — vitest isolates
// test files, so each test file gets a fresh one.
type ContextMemory<T = any> = {
    meta: Meta<T> | null;
    currentStory: StoryObj<T> | null;
    playContext: StoryContext<ReactRenderer, T> | null;
    // Written (reset) by asStory but never read anywhere in this package.
    playFunction: PlayFunction<ReactRenderer, T> | null;
};

// The single shared instance — fields start empty and are mutated in place.
const storyMemory: ContextMemory = {
    meta: null,
    currentStory: null,
    playContext: null,
    playFunction: null
};

/**
 * Accessor over that shared instance. `$memory()` returns the live object, which is
 * what callers mutate (`$memory().currentStory ||= {}`); reading a field without the
 * call (`$memory.meta`) is routed through the callback and hands back the same value.
 */
export const $memory = functionControl(({ key }) => {
    return key ? (storyMemory as any)[key] : storyMemory;
});
