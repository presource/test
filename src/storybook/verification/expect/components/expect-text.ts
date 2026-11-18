import { expect } from 'storybook/test';
import { $dom } from '../../selector';

/**
 * Asserts that every fragment is visible in the story canvas, one at a time and in
 * the order given. A fragment is a string or RegExp and goes straight to the text
 * selector, which turns a string into a RegExp.
 */
export const expectText = async (...fragments: any[]) => {
    for (const value of fragments) {
        // Labels the step for the test log: an interpolated template string is never
        // falsy, so this expect cannot fail — the check that matters is the next line.
        // valueOf() only changes anything for boxed primitives (new String('x'));
        // a plain string or RegExp interpolates the same either way.
        await expect(`expecting ${value.valueOf()} to be visible on the screen`).toBeTruthy();
        await $dom.text(value).isValid();
    }
};
