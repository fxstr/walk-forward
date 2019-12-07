import createInstructionMethod from './createInstructionMethod.mjs';

export default (data, selectFunction) => createInstructionMethod(
    data,
    selectFunction,
    'rebalance',
    (value) => {
        if (typeof value !== 'boolean') {
            throw new Error(`rest: Return value of rest function must be boolean; you returned ${value} instead.`);
        }
        // Function is rest, field on instructions is trade (the exact opposite)
        return value;
    },
);

