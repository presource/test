import { arrayEnsures, stringSwitchAsync } from '@presource/core';
import { expectText } from './components';

/**
 * Option-object front end for the assertions: each key names a matcher and its
 * value is either a single input or a list of them. Keys are walked in insertion
 * order and awaited one at a time.
 *
 * `text` is the only case declared, so any other key matches nothing in the switch
 * and is skipped silently. Unknown keys are rejected at compile time (SnapshotOptions
 * declares `text` only), never at runtime.
 */
export const expectSnapshot = async (options: SnapshotOptions) => {
    // The matcher names, i.e. the option object's own keys.
    const keys: (keyof typeof options)[] = Object.keys(options) as any;
    for (const key of keys) {
        // Dispatch on the matcher name. arrayEnsures normalizes a single string or
        // RegExp into a one-item list so both forms spread into expectText(...).
        await stringSwitchAsync(key, {
            text: async () => await expectText(...arrayEnsures(options[key]))
        });
    }
};

// One text matcher input: a substring or a pattern to look for.
type SnapshotInput = string | RegExp;
// Either a single input or the list form.
type SnapshotOptionInput = SnapshotInput | SnapshotInput[];

// The supported matcher groups — currently only `text`.
export type SnapshotOptions = Partial<{
    text: SnapshotOptionInput;
}>;
