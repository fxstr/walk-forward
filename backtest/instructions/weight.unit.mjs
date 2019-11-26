import test from 'ava';
import weightFunction from './weight.mjs';
import createTestData from '../testData/createTestData.mjs';

test('fails if function returns invalid value', (t) => {
    const { data } = createTestData();
    t.throws(() => weightFunction(data, () => true), /must be a number/);
});

test('updates selected on instructions', (t) => {
    const { data } = createTestData();
    // Set selected to 1 on even dates
    const newData = weightFunction(
        data,
        item => (new Date(item[0].get('date')).getDate() % 2 === 0 ? 1 : 0),
    );
    const allSelected = newData.instructions.map(({ weight }) => weight);
    t.deepEqual(allSelected, [0, 1, 1, 0, 1, 1, 1, 0]);
});
