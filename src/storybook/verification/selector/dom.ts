import { documentButton, documentNode, documentText } from './components';

// Element selectors for visual tests, so a story names what it wants instead of
// writing queries: $dom.button(label), $dom.text(fragment), $dom.node(element).
// Each entry returns a chainable options object with element()/action methods.
export const $dom = {
    // Finds a button by accessible name and exposes click()/isValid().
    button: documentButton,
    // Navigates from one element to a sibling's shared container.
    node: documentNode,
    // Finds the first element matching a text fragment and exposes isValid().
    text: documentText
};
