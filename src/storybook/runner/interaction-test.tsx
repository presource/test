import type { Meta, StoryObj } from '@storybook/react';
import { composeStories } from '@storybook/react';
import React from 'react';
import { unmountElement } from '@storybook/react-dom-shim';

// A properly typed CSF module shape
type StoriesModule = {
    default: Meta<any>;
    [key: string]: StoryObj<any> | Meta<any>;
};

/**
 * Tears a story's React root down while the jsdom environment is still alive.
 *
 * WHY THIS EXISTS — the `ReferenceError: window is not defined` flake that made
 * `@presource/react#test` fail ~25% of runs with `Test Files 18 passed / Tests 53
 * passed / Errors 1` and exit 1:
 *
 * 1. vitest's jsdom environment does NOT patch `setTimeout`/`setInterval` (its
 *    global-population lists in node_modules/vitest/dist/chunks/index.DC7d2Pf8.js
 *    omit both), so every timer a story schedules is a plain Node timer.
 * 2. Storybook never unmounts a story when `Story.run()` resolves. preview-api's
 *    `runStory` pushes the canvas unmount into a module-level `cleanups` array and
 *    only drains that array at the START of the next run — never after the last one
 *    (node_modules/storybook/dist/_browser-chunks/chunk-SZQXB3JV.js:1162 declares
 *    `cleanups`, :1226 pushes the unmount, :1247 and :1309-1311 are the only drains).
 *    So the LAST story of every story file is still mounted — and still holding its
 *    pending timers — when vitest finishes the file: jsdom's `window.close()` →
 *    `stopAllTimers()` clears only jsdom's own `listOfActiveTimers`, then the
 *    environment teardown does `delete globalThis.window`.
 * 3. ~550ms later the still-pending Node timer fires into a world without `window`:
 *    `@mui/utils/useTimeout` → `ButtonBase/Ripple.mjs:47` → `TouchRipple.mjs:449
 *    onExited` → `dispatchSetState` → react-dom's `getCurrentEventPriority`
 *    (react-dom.development.js:10993) reads `window.event` → uncaught
 *    ReferenceError. Observed origin: `src/context/local.test.tsx`, whose single
 *    story is by definition its file's last one.
 *
 * Unmounting cancels those timers rather than racing them: TouchRipple/Fade clear
 * their pending `useTimeout` handles from `useEffect` cleanups, and effect cleanups
 * run as part of the unmount — which only helps while `window` still exists, i.e.
 * inside the test, not after it.
 *
 * WHY `act()`: the unmount is queued React work, and @storybook/react mounts the
 * story inside `act` with `IS_REACT_ACT_ENVIRONMENT` forced on
 * (node_modules/@storybook/react/dist/_browser-chunks/chunk-L3JF7GGZ.js:26-82 and
 * :131-139). Draining the same work outside the act environment can leave the
 * passive-effect cleanups that own the timers queued past the point the test
 * returns, so the flag is forced on around the call exactly like storybook's own
 * `withGlobalActEnvironment`, and the returned thenable is awaited so the flush has
 * actually completed before the runner reports the test as done. No sleep/drain is
 * needed: awaiting `act` is what guarantees the timer-cancelling cleanups ran.
 */
const unmountStoryCanvas = async (canvasElement: HTMLElement) => {
    const previousActEnvironment = (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

    try {
        // `unmountElement` is the helper @storybook/react's `renderToCanvas` uses for
        // the unmount callback it hands to storybook; it resolves the react root from
        // a module-scoped Map keyed by the canvas element (node_modules/
        // @storybook/react-dom-shim/dist/react-18.js, `nodes`). Importing the same
        // specifier here reaches that same Map instance, and a canvas with no stored
        // root is a no-op — so this stays safe for stories that never mounted.
        await React.act(() => {
            unmountElement(canvasElement);
        });
    } finally {
        (globalThis as any).IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    }
};

export const storybookTestRunner = (stories: StoriesModule) => {
    const composed = composeStories(stories);

    Object.entries(composed).forEach(([name, Story]) => {
        // 30s per-story timeout: interaction stories await real timed
        // behaviour (async hooks ticking on macrotasks — see
        // repeating.stories.tsx) and selectors use generous findBy timeouts
        // (10s, see selector/components/button.ts). Under a full parallel
        // workspace run (turbo run test --force) vitest's 5s default can be
        // exceeded purely by event-loop starvation — a flake, not a failure.
        it(`${name} interaction test should pass`, { timeout: 30_000 }, async () => {
            // The canvas element is created (and owned) here rather than letting
            // `runStory` append its own div to document.body, because storybook
            // releases that div through the same deferred `cleanups` array described
            // above — a runner that wants a real teardown has to own the element it
            // unmounts. `run(context)` accepts a Partial<StoryContext> and
            // `canvasElement` is one of its fields (storybook/dist/csf/index.d.ts,
            // StoryContext declares it), so injecting it is supported rather than
            // incidental. Nothing downstream
            // changes: `$screen` scopes to `playContext.context.canvasElement`
            // (verification/constant/screen.ts) and `$user.click` (userEvent) only
            // requires the element to be attached to the document — both hold because
            // this div is appended to body, exactly where storybook put its own.
            const canvasElement = document.createElement('div');
            document.body.appendChild(canvasElement);

            try {
                await Story.run({ canvasElement });
            } finally {
                // `finally` so a failing play still releases the tree (the assertion
                // error propagates untouched — teardown never swallows or masks it).
                await unmountStoryCanvas(canvasElement);
                // Mirrors the container removal storybook's own deferred cleanup does
                // (chunk-SZQXB3JV.js:1311-1317); guarded, since the story tree may
                // already have detached it.
                if (document.body.contains(canvasElement)) {
                    document.body.removeChild(canvasElement);
                }
            }
        });
    });
};
