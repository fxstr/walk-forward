import test from 'ava';
import rest from './rest.mjs';
import createTestData from '../testData/createTestData.mjs';

test('fails if function returns invalid value', (t) => {
    const { data } = createTestData();
    t.throws(() => rest(data, () => 1), /must be boolean/);
});

test('updates selected on instructions', (t) => {
    const { data } = createTestData();
    // Set selected to 1 on even dates
    const newData = rest(
        data,
        item => (new Date(item[0].get('date')).getDate() % 2 !== 0),
    );
    const allSelected = newData.instructions.map(({ trade }) => trade);
    t.deepEqual(allSelected, [false, true, true, false, true, true, true, false]);
});
