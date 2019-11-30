import test from 'ava';
import select from './select.mjs';

test('fails if function returns invalid value', (t) => {
    const data = { instructionFunctions: [] };
    const newData = select(data, () => true);
    t.throws(() => newData.instructionFunctions[0].validate(true), /must be -1/);
});

test('updates instructionFunctions', (t) => {
    const data = { instructionFunctions: [] };
    // Set selected to 1 on even dates
    const newData = select(
        data,
        () => {},
    );
    const [firstInstruction] = newData.instructionFunctions;
    t.is(firstInstruction.instructionField, 'selected');
    t.is(typeof firstInstruction.instructionFunction, 'function');
    t.is(typeof firstInstruction.validate, 'function');
});
