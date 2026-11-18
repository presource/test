import { asStory } from './story';
import { PlayFunction } from 'storybook/internal/types';

/**
 * Declares the current story as an interaction test: registers `playFunction` as
 * the story's play step through asStory, so the storybook runner executes it
 * (see runner/interaction-test.tsx).
 */
export const asTestStory = (playFunction: PlayFunction<any, any>) => {
    return asStory({
        play: playFunction
    });
};
