import createInstructionMethod from './createInstructionMethod.mjs';

export default (data, weightFunction) => createInstructionMethod(
    data,
    weightFunction,
    'weight',
    (value) => {
        if (typeof value !== 'number') {
            throw new Error(`weight: Return value of weight function must be a number; you returned ${value} instead.`);
        }
        return value;
    },
);

