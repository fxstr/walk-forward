import test from 'ava';
import rebalance from './rebalance.mjs';
import createTestData from '../testData/createTestData.mjs';

test('fails if function returns invalid value', (t) => {
    const { data } = createTestData();
    t.throws(() => rebalance(data, () => 1), /must be boolean/);
});

test('updates selected on instructions', (t) => {
    const { data } = createTestData();
    // Set selected to 1 on even dates
    const newData = rebalance(
        data,
        item => (new Date(item[0].get('date')).getDate() % 2 !== 0),
    );
    const allSelected = newData.instructions.map(instruction => instruction.rebalance);
    t.deepEqual(allSelected, [true, false, false, true, false, false, false, true]);
});
