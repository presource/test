import { expectText } from './components';
import { expectSnapshot } from './snapshot';

// Assertion entry point: `$expect.text(...fragments)` checks visible text, and
// `$expect.snapshot({ text })` runs the same check through the option-object form.
export const $expect = {
    text: expectText,
    snapshot: expectSnapshot
};
