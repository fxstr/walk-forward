import test from 'ava';
import weight from './weight.mjs';

test('fails if function returns invalid value', (t) => {
    const data = { instructionFunctions: [] };
    const newData = weight(data, () => true);
    t.throws(() => newData.instructionFunctions[0].validate(true), /must be a number/);
});

test('updates instructionFunctions', (t) => {
    const data = { instructionFunctions: [] };
    const newData = weight(
        data,
        () => {},
    );
    const [firstInstruction] = newData.instructionFunctions;
    t.is(firstInstruction.instructionField, 'weight');
    t.is(typeof firstInstruction.instructionFunction, 'function');
    t.is(typeof firstInstruction.validate, 'function');
});

