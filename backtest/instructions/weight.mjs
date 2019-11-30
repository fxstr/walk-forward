import addInstructionFunction from './addInstructionFunction.mjs';

export default (data, indicatorFunction) => (
    addInstructionFunction(data, indicatorFunction, 'weight', (value) => {
        if (typeof value !== 'number') {
            throw new Error(`weight: Return value of weight function must be a number; you returned ${value} instead.`);
        }
        return value;
    })
);

