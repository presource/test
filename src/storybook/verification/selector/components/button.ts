import { functionOptions } from '@presource/core';
import { $screen, $user } from '../../constant';
import { expect } from 'storybook/test';

/**
 * Button selector by accessible name: `element()` resolves the button, `click()`
 * performs the click through userEvent, and `isValid()` runs constraint validation
 * on it. Matching is `findByRole('button', { name })`, so the label has to be the
 * button's accessible name, not arbitrary inner text.
 */
export const documentButton = (label: string) => {
    return functionOptions({
        // Resolves the button through $screen, so the lookup is scoped to this story's canvas.
        async element() {
            // `findByRole` polls until a match appears; if none does it rejects at the timeout.
            // Generous timeout: some interaction stories await async hooks
            // that only render this label after repeated timed iterations
            // (e.g. repeating.stories.tsx waits for 10 x 100ms ticks). Under a
            // full parallel workspace test run (turbo run test --force) the
            // event loop can be starved well past the previous 2s default,
            // producing flakes — 10s keeps the wait deterministic under load.
            return await $screen.findByRole('button', { name: label }, { timeout: 10_000 });
        },
        // Re-resolves the button (nothing is cached), then clicks a fresh $user instance.
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
