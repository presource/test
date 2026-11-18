import { asStory } from '../story';

// Callable parameter accessor, like the other $-helpers it reads the current
// story: `$parameters()` returns its parameters untouched (Object.assign treats an
// undefined source as a no-op), `$parameters(input)` merges `input` into them and
// returns the merged object. The implementation is one function either way — the
// two call signatures differ only by that optional parameter.
type StorybookParameters = {
    (): { [key: string]: any };
    (input?: { [key: string]: any }): { [key: string]: any };
};

export const $parameters: StorybookParameters = ((parameters: any) => {
    const context = asStory();

    const currentParameters = (context.parameters ||= {});

    Object.assign(currentParameters, parameters);

    return currentParameters;
}) as any;
