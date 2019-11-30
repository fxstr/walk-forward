import addInstructionFunction from './addInstructionFunction.mjs';

export default (data, indicatorFunction) => (
    addInstructionFunction(data, indicatorFunction, 'trade', (value) => {
        if (typeof value !== 'boolean') {
            throw new Error(`rest: Return value of rest function must be boolean; you returned ${value} instead.`);
        }
        return value;
    })
);

