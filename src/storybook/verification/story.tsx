import { StoryObj } from '@storybook/react';
import { $memory } from './constant';
import { typeSwitch } from '@presource/core';
import { PlayFunction } from 'storybook/internal/types';
import React from 'react';

// Internal shape accepted by asStory — extends StoryObj with an optional
// `component` property that asStory converts into a `render` function.
// Storybook 8's StoryObj no longer carries `component` at the story level,
// so we define our own input type to support it.
type AsStoryInput = {
    component?: React.ComponentType<any>;
    play?: PlayFunction<any, any>;
    args?: any;
    parameters?: any;
    [key: string]: any;
};

export type AsStory = {
    (): StoryObj<any>;
    // tslint:disable-next-line:unified-signatures
    (update?: AsStoryInput): StoryObj<any>;
    // tslint:disable-next-line:unified-signatures
    (callback?: () => void): StoryObj<any>;
};

export const asStory: AsStory = ((input: any) => {
    // Create a base current story for modification
    $memory().currentStory ||= {};
    // Clear out the play function
    $memory().playFunction = null;

    typeSwitch(input, {
        object: ({ value }) => {
            const { component: Component, ...rest } = value;

            const currentStory: any = {
                ...rest,
                play: async (context: any) => {
                    $memory().playContext = context;
                    await value.play?.(context);
                }
            };
            if (Component) {
                currentStory.render = (props: any) => {
                    return <Component key={JSON.stringify(props || {})} {...props} />;
                };
            }

            $memory().currentStory = currentStory;
        },
        function: ({ value, object }) => {
            // @ts-ignore
            object(value() || $memory().currentStory);
        }
    });

    return $memory().currentStory;
}) as any;
