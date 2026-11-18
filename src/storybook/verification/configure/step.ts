import { $memory } from '../constant';

// Story step helper: delegates to Storybook's own `context.step`, read from the
// module-level $memory singleton. That context only exists while a play function is
// running, so the `?.` means a step called outside a play() run resolves immediately
// and drops the title and callback silently.
type StorybookStep = (title: string, step: () => Promise<void | HTMLElement>) => Promise<void>;
export const $step: StorybookStep = async (title, stepCallback) => {
    await $memory().playContext?.step(title, stepCallback as any);
};
