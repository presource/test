import { functionControl } from '@presource/core';
import { userEvent } from 'storybook/test';

/**
 * userEvent actions read by name (`$user.click`, `$user.type`, ...).
 *
 * NOTE the behaviour callers must know: `userEvent.setup()` runs on EVERY property
 * access, so each action comes from its own instance and nothing is shared between
 * two calls (no carried-over pointer or clipboard state, and a setup() with custom
 * options is not reused). An unknown key resolves to undefined.
 */
export const $user = functionControl(({ key }) => {
    const user = userEvent.setup();
    return user[key as keyof typeof user]?.bind(user);
}) as ReturnType<typeof userEvent.setup>;
