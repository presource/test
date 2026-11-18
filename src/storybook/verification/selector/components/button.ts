import { functionOptions } from '@presource/core';
import { $screen, $user } from '../../constant';
import { expect } from 'storybook/test';

export const documentButton = (label: string) => {
    return functionOptions({
        // For selecting the button element
        async element() {
            // return the button element
            // Generous timeout: some interaction stories await async hooks
            // that only render this label after repeated timed iterations
            // (e.g. repeating.stories.tsx waits for 10 x 100ms ticks). Under a
            // full parallel workspace test run (turbo run test --force) the
            // event loop can be starved well past the previous 2s default,
            // producing flakes — 10s keeps the wait deterministic under load.
            return await $screen.findByRole('button', { name: label }, { timeout: 10_000 });
        },
        // For clicking on the button
        async click() {
            const element = await this.element();
            await $user.click(element);
        },
        async isValid() {
            const element = await this.element();
            await expect(element).toBeValid();
        }
    });
};
