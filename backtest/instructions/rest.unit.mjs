import test from 'ava';
import rest from './rest.mjs';

test('fails if function returns invalid value', (t) => {
    const data = { instructionFunctions: [] };
    const newData = rest(data, () => 1);
    t.throws(() => newData.instructionFunctions[0].validate(1), /must be boolean/);
});

test('updates instructionFunctions', (t) => {
    const data = { instructionFunctions: [] };
    // Set selected to 1 on even dates
    const newData = rest(
        data,
        () => {},
    );
    const [firstInstruction] = newData.instructionFunctions;
    t.is(firstInstruction.instructionField, 'trade');
    t.is(typeof firstInstruction.instructionFunction, 'function');
    t.is(typeof firstInstruction.validate, 'function');
});

