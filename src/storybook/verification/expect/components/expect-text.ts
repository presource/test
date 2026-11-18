import { expect } from 'storybook/test';
import { $dom } from '../../selector';

export const expectText = async (...fragments: any[]) => {
    for (const value of fragments) {
        await expect(`expecting ${value.valueOf()} to be visible on the screen`).toBeTruthy();
        await $dom.text(value).isValid();
    }
};
