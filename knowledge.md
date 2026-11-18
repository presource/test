# @presource/test Knowledge

Storybook testing and verification utility library — fluent assertion DSL for visual testing.

> **Last verified:** 2026-11-19
> **Package name:** `@presource/test`
> **Workspace dependencies:** `@presource/core`, `@presource/web`
> **Peer dependencies:** `@storybook/react`, `@testing-library/react`, `react`, `storybook`

---

## How to Update This File

1. Read `src/index.ts` for current exports
2. Check sub-modules: `storybook/controls`, `storybook/runner`, `storybook/verification`
3. Update the "Last verified" date

---

## Index

### Storybook Controls
- [configureStoryControls](#configurestorycontrols) — Configure Storybook argTypes/args

### Storybook Runner
- [storybookTestRunner](#storybooktestrunner) — Generate it() tests from stories

### Verification DSL
- [asStory](#asstory) — Story context accessor
- [asTestStory](#asteststory) — Wrap play function as story
- [$parameters](#parameters) — Get/set story parameters
- [$play](#play) — Get/set play function
- [$step](#step) — Named step execution
- [$screen](#screen) — DOM screen selector
- [$user](#user) — User event simulator
- [$expect](#expect) — Assertion helpers
- [$dom](#dom) — DOM selector utilities

---

## Storybook Controls

### configureStoryControls

Configures Storybook `Meta` argTypes and args from a simplified control definition.

```ts
import { configureStoryControls } from '@presource/test';

const meta: Meta = {
    title: 'Button',
    ...configureStoryControls({}, {
        label: { type: 'string', defaultValue: 'Click Me' },
        isLoading: { type: 'boolean', defaultValue: false }
    })
};
```

---

## Storybook Runner

### storybookTestRunner

Generates `it()` test cases for each composed story.

```ts
import { storybookTestRunner } from '@presource/test';
import * as ButtonStories from './Button.stories';

storybookTestRunner(ButtonStories);
```

---

## Verification DSL

### asStory

Get/set the current story context.

```ts
import { asStory, $parameters, $play, $expect } from '@presource/test';

// Set up a story
asStory({
    args: { label: 'Test' }
});

// Configure parameters
$parameters({ docs: { disable: true } });

// Set play function
$play(async ({ canvasElement }) => {
    // interaction steps
});
```

### $step

Execute a named step within a play function.

```ts
$step('Click button', async () => {
    const button = await $dom.button('Click Me').element();
    await $user.click(button);
});
```

### $expect

Assertion helpers.

```ts
// Assert text is visible
$expect.text('Hello World');

// Snapshot verification
$expect.snapshot({ text: 'expected content' });
```

### $dom

DOM selector utilities.

```ts
// Find button by label
const btn = $dom.button('Submit');
await btn.element();
await btn.click();
btn.isValid();

// Find text content
const text = $dom.text('Hello');
await text.element();
text.isValid();

// Find related DOM nodes
const node = $dom.node(anchor);
const sibling = node.sibling(siblingElement);
```

### $screen and $user

Proxied via `functionControl` for method access.

```ts
// $screen wraps within(canvasElement) from Storybook test utils
const element = await $screen.findByRole('button');

// $user wraps userEvent.setup()
await $user.click(element);
```
