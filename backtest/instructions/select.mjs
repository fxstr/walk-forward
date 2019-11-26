import createInstructionMethod from './createInstructionMethod.mjs';

export default (data, selectFunction) => createInstructionMethod(
    data,
    selectFunction,
    'selected',
    (value) => {
        if (![-1, 0, 1].includes(value)) {
            throw new Error(`select: Return value of select function must be -1 (go short), 0 (no trade) or 1 (go long); you returned ${value} instead.`);
        }
        return value;
    },
);

