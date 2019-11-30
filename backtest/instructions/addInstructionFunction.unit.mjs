import test from 'ava';
import addInstructionFunction from './addInstructionFunction.mjs';
import walkStructure from '../dataHelpers/walkStructure.mjs';

test('throws if instructionFunction is not a function', (t) => {
    // Function is provided by user, therefore we have to check the input
    t.throws(
        () => addInstructionFunction({}, 'notAFn', 'selected', () => {}),
        /must be a function/,
    );

});

test('adds properties as expected', (t) => {

    const data = {
        instructionFunctions: [],
    };
    const fn = () => {};
    const validate = () => {};
    const result = addInstructionFunction(data, fn, 'selected', validate);
    t.deepEqual(result, {
        instructionFunctions: [{
            instructionFunction: fn,
            validate,
            instructionField: 'selected',
        }],
    });
});

test('does not modify original data', (t) => {
    const data = {
        instructionFunctions: [],
    };
    const clone = walkStructure(data);
    addInstructionFunction(data, () => {}, 'selected', () => {});
    t.deepEqual(data, clone);
});
