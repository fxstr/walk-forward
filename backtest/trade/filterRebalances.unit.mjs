import test from 'ava';
import filterRebalances from './filterRebalances.mjs';
import walkStructure from '../dataHelpers/walkStructure.mjs';

const createData = (selected = 1, rebalance = false, size = 10) => {
    const instructions = [{
        selected,
        rebalance,
        instrument: 'aapl',
    }];
    const positions = [{
        instrument: 'aapl',
        size,
    }];
    return { positions, instructions };
};

test('does not filter if rebalance is true', (t) => {
    const { instructions, positions } = createData(-1, true, -5);
    t.deepEqual(filterRebalances(instructions, positions), instructions);
});

test('does not filter if direction changes', (t) => {
    const { instructions, positions } = createData(1, false, -5);
    t.deepEqual(filterRebalances(instructions, positions), instructions);
});

test('does not filter there was no position', (t) => {
    const { instructions } = createData(-1, false);
    t.deepEqual(filterRebalances(instructions, []), instructions);
});

test('does not filter if new selected is 0', (t) => {
    const { instructions, positions } = createData(0, false);
    t.deepEqual(filterRebalances(instructions, positions), instructions);
});

test('filters if there was a position', (t) => {
    const { instructions, positions } = createData();
    t.deepEqual(filterRebalances(instructions, positions), []);
});

test('does not modify data', (t) => {
    const { instructions, positions } = createData(-1, false);
    const originalInstructions = walkStructure(instructions);
    const originalPositions = walkStructure(positions);
    filterRebalances(instructions, positions);
    t.deepEqual(instructions, originalInstructions);
    t.deepEqual(positions, originalPositions);
});
