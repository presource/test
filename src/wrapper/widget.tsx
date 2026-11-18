import React from 'react';
import { propsReactive } from './reactive';

// Local flex-column layout for the wrapper, so this package has no headless UI dependency.
const flexColumnStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
    flexBasis: 'auto',
    flexGrow: 0,
    width: '100%',
    boxSizing: 'border-box',
    gap: 2
};

/**
 * Wraps a component for a story: the wrapper owns a small reactive state object
 * (`{ value }`, seeded with `defaultValue`) and passes it to the component as the
 * `data` prop, printing that state as JSON above the component so a story shows
 * what the widget currently holds. Writes the component makes through `data`
 * re-render this wrapper (see ./reactive).
 */
export const widgetTestWrapper = (Component: React.FC<any>, defaultValue = '') => {
    return React.memo((props: any) => {
        // The wrapper's own state: a reactive `{ value }` object, so any write the
        // component performs through it (e.g. an input's onChange) triggers a refresh.
        const data = propsReactive({
            value: defaultValue
        });

        return (
            <div style={flexColumnStyle}>
                <pre>{JSON.stringify(data, null, 2)}</pre>
                <Component {...props} data={data} />
            </div>
        );
    });
};
