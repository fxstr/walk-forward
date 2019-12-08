import test from 'ava';
import transformRebalances from './transformRebalances.mjs';
import walkStructure from '../dataHelpers/walkStructure.mjs';

const createInstruction = (rebalance, selected) => ({
    rebalance,
    selected,
});

test('updates values', (t) => {

    const instructions = [
        // Should trade, previous select was 0 (default)
        createInstruction(false, -1),
        // Should trade because direction changes
        createInstruction(false, 1),
        // Should not trade, same direction
        createInstruction(false, 1),
        // Should trade: direction changes
        createInstruction(false, 0),
        // Should trade: rebalance is true
        createInstruction(true, 0),
    ];

    const result = transformRebalances(instructions).map(({ trade }) => trade);
    t.deepEqual(result, [true, true, false, true, true]);

});

test('does not trade if first selected is 0', (t) => {
    const instructions = [createInstruction(false, 0)];
    t.deepEqual(transformRebalances(instructions).map(({ trade }) => trade), [false]);
});

test('does not modify original data', (t) => {
    const instructions = [createInstruction(false, 0), createInstruction(true, 1)];
    const clone = walkStructure(instructions);
    transformRebalances(instructions);
    t.deepEqual(clone, instructions);
});
