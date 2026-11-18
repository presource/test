import { functionOptions, typeSwitch } from '@presource/core';
import { $screen } from '../../constant';
import { expect } from 'storybook/test';

/**
 * Text selector: `element()` resolves the first element whose text matches the
 * fragment, and `isValid()` asserts that element passes constraint validation
 * (jest-dom's `toBeValid`).
 */
export const documentText = (fragment: string | RegExp) => {
    return functionOptions({
        // Resolves the match through $screen, i.e. scoped to this story's canvas.
        element: async () => {
            // A string becomes an unanchored RegExp, so the fragment matches any
            // element whose text CONTAINS it — and regex metacharacters in a plain
            // string are read as pattern syntax. A RegExp is used as given.
            const expression = typeSwitch(fragment, {
                string: ({ value }) => {
                    return new RegExp(value);
                },
                default: ({ value }) => value
            });

            // findAllByText rejects on timeout when nothing matches, so this cannot
            // receive an empty list.
            const list = await $screen.findAllByText(expression);

            // Text can appear in several places (label, wrapper, control); the first
            // match in document order is the one every later assertion runs against.
            return list[0];
        },
        async isValid() {
            const element = await this.element();
            await expect(element).toBeValid();
        }
    });
};
