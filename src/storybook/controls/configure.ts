import React from 'react';
import { Meta } from '@storybook/react';
import { objectMap, objectMerge, typeSwitch } from '@presource/core';

type AllowableType = string | number | boolean;
type StandardControlOptions = AllowableType | AllowableType[];
type ComplexControlOptions = { [key: string]: AllowableType };
type ControlSettingFullOptions = {
    default: any;
    options?: StandardControlOptions | ComplexControlOptions;
    control?: string;
};
type ReactNodeOptionList = {
    [key: string]: React.ReactNode;
};

type ControlList = {
    [key: string]: StandardControlOptions | ControlSettingFullOptions | ReactNodeOptionList;
};

type ConfigureStoryControls = (meta: Meta<any>, controls?: ControlList) => ConfigureStoryControls;

/**
 * Registers story controls on a Meta: each entry of `controls` is normalised, turned
 * into a storybook `argType` with a default, merged into `meta.argTypes`, and the
 * collected defaults are merged into `meta.args`. objectMerge returns a NEW object
 * and lets the later argument win, so the freshly registered entries overwrite any
 * existing argType/arg of the same key (nested objects merge instead of replacing).
 *
 * The return value is a second-stage function that registers the same way on another
 * Meta, merging the caller's controls with the argTypes just registered; those sit
 * last in that merge and therefore win any key collision against the new controls.
 */
export const configureStoryControls: ConfigureStoryControls = (meta, controls = {}) => {
    const fullControls = convertToStandardFormat(controls);
    const storybookControls = convertToStorybookFormat(fullControls);

    meta.argTypes = objectMerge((meta.argTypes ||= {}), storybookControls);
    const { argTypes } = meta;

    const args = objectMap(argTypes as typeof storybookControls, ({ value }) => {
        return value.default;
    });

    meta.args = objectMerge((meta.args ||= {}), args);

    return (newMeta, newControls = {}) => {
        return configureStoryControls(newMeta, objectMerge(newControls, argTypes));
    };
};

// Normalises every accepted control shape into `{ default, options?, control }`:
// a primitive becomes its own default with the matching control type, an option list
// becomes a radio or a select, and a plain object is read as a label -> value map.
const convertToStandardFormat = (controls: ControlList) => {
    return objectMap(controls, ({ value: option }) => {
        return typeSwitch(option, {
            boolean: ({ value }) => ({
                default: value,
                control: 'boolean'
            }),
            number: ({ value }) => ({
                default: value,
                control: 'number'
            }),
            string: ({ value }) => ({
                default: value,
                control: 'text'
            }),
            array: ({ value }) => {
                // The first entry doubles as the default; below 5 options every choice
                // stays visible as a radio, from 5 up they collapse into a select.
                const initialValue = value[0];
                if (value.length < 5) {
                    return {
                        default: initialValue,
                        options: value,
                        control: 'radio'
                    };
                }
                return {
                    default: initialValue,
                    options: value,
                    control: 'select'
                };
            },
            function: () => {
            },
            default: ({ value }: any) => {
                // Already-normalised settings (they carry `control`) pass straight through.
                if (value.control) return value;
                // Otherwise it is an option map: the keys are what the select shows, the
                // object is the label -> value mapping handed back to the story, and the
                // labels map each key to itself.
                const keyList = Object.keys(value);
                return {
                    options: keyList,
                    mapping: value,
                    control: {
                        type: 'select',
                        labels: objectMap(value, ({ key }) => key)
                    }
                };
            }
        });
    }) as {
        [key: string]: ControlSettingFullOptions;
    };
};

// Storybook expects `control` to be an object, so a plain string type becomes
// `{ type }` and an already-shaped object control (the select-with-labels form)
// replaces it wholesale. Anything else — undefined included — leaves the
// placeholder `{ type: '' }` in the argType.
const convertToStorybookFormat = (controls: { [key: string]: ControlSettingFullOptions }) => {
    return objectMap(controls, ({ value }) => {
        const { control } = value;
        // Copy of the normalised setting with the object-shaped control pre-seeded,
        // so the string branch only has to fill in `type`.
        const result: any = {
            ...value,
            control: {
                type: ''
            }
        };

        typeSwitch(control, {
            string: () => {
                result.control.type = control;
            },
            object: () => {
                result.control = control;
            }
        });

        return result;
    });
};
