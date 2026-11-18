import { ReactRenderer } from '@storybook/react';
import { PlayFunction } from 'storybook/internal/types';
import { asStory } from '../story';

// Play-step accessor for the current story: `$play(fn)` installs `fn` as the
// story's play function, `$play()` only reads it. Both arms return `context.play`,
// so a story that never set one returns undefined even though the declared type
// promises a PlayFunction.
type ConfigureStorybookPlay<Args = {}> = {
    (): PlayFunction<ReactRenderer, Args>;
    (playFunction: PlayFunction<ReactRenderer, Args>): PlayFunction<ReactRenderer, Args>;
};

export const $play = ((playFunction: any) => {
    // The story being configured; asStory() with no input returns the current story
    // as-is (creating an empty one the first time).
    const context = asStory();

    if (playFunction) {
        // Plain assignment, so it REPLACES the play function asStory built for an
        // asStory({ play }) story — and that wrapper is what records
        // $memory().playContext for $screen/$step. No caller in this repo combines the
        // two styles, so that combination is untested.
        context.play = playFunction;
    }

    // Reads back whatever the story holds now: the function just assigned, the one
    // already there, or undefined.
    return context.play;
}) as any;
