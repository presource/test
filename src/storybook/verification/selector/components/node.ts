import { functionOptions } from '@presource/core';
import { expect } from 'storybook/test';

// The element itself plus every node above it, nearest first: the chain runs
// element -> ... -> html -> document and stops when parentNode is null.
const documentNodeAncestors = (documentNode: HTMLElement) => {
    const ancestors: HTMLElement[] = [];
    while (documentNode) {
        ancestors.push(documentNode);
        documentNode = documentNode.parentNode as HTMLElement;
    }
    return ancestors;
};

/**
 * Element selector anchored on one node: `sibling(other)` locates the container the
 * two elements share, which is the practical way to reach the row/group a node sits
 * in without a CSS query.
 */
export const documentNode = (anchor: HTMLElement) => {
    return functionOptions({
        // Walks up from `siblingElement` and returns the first node that is also an
        // ancestor of `anchor`: the CLOSEST element containing both.
        sibling: async (siblingElement: HTMLElement) => {
            // The anchor's own ancestry, collected once before the walk.
            const ancestors = documentNodeAncestors(anchor);

            // The walk starts at the sibling itself, so a sibling that already IS a
            // shared container is returned unchanged.
            let element = siblingElement;
            while (element) {
                if (ancestors.includes(element)) return element;
                // One level up, looking for the first node the two chains have in common.
                element = element.parentNode as HTMLElement;
            }
            // Only reachable when no common node exists, which means the sibling is not
            // attached to the same document (attached nodes always meet at `document`).
            // `element` is null here, so this asserts rather than resolving to undefined.
            await expect(element).toBeValid();
        }
    });
};
