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

export const widgetTestWrapper = (Component: React.FC<any>, defaultValue = '') => {
    return React.memo((props: any) => {
        // Widget uses standard data input
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
