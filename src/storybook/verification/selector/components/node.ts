import { functionOptions } from '@presource/core';
import { expect } from 'storybook/test';

// Returns the list of document nodes ancestors
const documentNodeAncestors = (documentNode: HTMLElement) => {
    const ancestors: HTMLElement[] = [];
    while (documentNode) {
        ancestors.push(documentNode);
        documentNode = documentNode.parentNode as HTMLElement;
    }
    return ancestors;
};

export const documentNode = (anchor: HTMLElement) => {
    return functionOptions({
        // Accessingthe sibling listing
        sibling: async (siblingElement: HTMLElement) => {
            // Getting the list of ancestors
            const ancestors = documentNodeAncestors(anchor);

            // Letting the selected element
            let element = siblingElement;
            while (element) {
                if (ancestors.includes(element)) return element;
                // Get the parent element
                element = element.parentNode as HTMLElement;
            }
            // The element shouldb e valid, but it shouldn't reach here
            await expect(element).toBeValid();
        }
    });
};
