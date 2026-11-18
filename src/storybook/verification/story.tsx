import { StoryObj } from '@storybook/react';
import { $memory } from './constant';
import { typeSwitch } from '@presource/core';
import { PlayFunction } from 'storybook/internal/types';
import React from 'react';

// Internal shape accepted by asStory — the story fields it understands plus a
// `component` property that asStory turns into a `render` function. Storybook's
// `StoryObj` resolves to `StoryAnnotations`, which has no story-level `component`
// key, so this input type is declared here instead of extending StoryObj.
type AsStoryInput = {
    component?: React.ComponentType<any>;
    play?: PlayFunction<any, any>;
    args?: any;
    parameters?: any;
    [key: string]: any;
};

// Three call shapes, all returning the stored story: no argument (read), an input
// object (store), or a callback whose return value is stored. The callback arm is
// declared `() => void` even though asStory uses what it returns — the signature does
// not describe the runtime contract.
export type AsStory = {
    (): StoryObj<any>;
    (update?: AsStoryInput): StoryObj<any>;
    (callback?: () => void): StoryObj<any>;
};

/**
 * Reads and updates the one story held in the shared $memory singleton.
 *   asStory()        - make sure a story exists, then return it
 *   asStory({ ... }) - store the object as the current story: `component` is turned
 *                      into a `render` whose `key` is the stringified props (so a
 *                      props change remounts instead of reusing the element), and
 *                      `play` is wrapped so the storybook context is recorded in
 *                      $memory before the caller's own play runs
 *   asStory(fn)      - call fn and store its return value as if it were passed in;
 *                      a falsy return falls back to the story already held
 */
export const asStory: AsStory = ((input: any) => {
    // First call creates the placeholder story; later calls keep what is stored.
    $memory().currentStory ||= {};
    // Reset the playFunction slot (written here and nowhere reads it).
    $memory().playFunction = null;

    typeSwitch(input, {
        object: ({ value }) => {
            const { component: Component, ...rest } = value;

            const currentStory: any = {
                ...rest,
                play: async (context: any) => {
                    // Records the live context for $screen / $step, then delegates.
                    $memory().playContext = context;
                    await value.play?.(context);
                }
            };
            if (Component) {
                // Keyed by the props so a props change produces a fresh mount.
                currentStory.render = (props: any) => {
                    return <Component key={JSON.stringify(props || {})} {...props} />;
                };
            }

            $memory().currentStory = currentStory;
        },
        function: ({ value, object }) => {
            // @ts-ignore - typeSwitch types the matched function as `(...) => void`,
            // so `value()` is `void` and TS1345 rejects testing it for truthiness; at
            // runtime it returns the object to store (or nothing, hence the fallback).
            object(value() || $memory().currentStory);
        }
    });

    return $memory().currentStory;
}) as any;
