import test from 'ava';
import getTotalCapital from './getTotalCapital.mjs';
import createTestResultData from '../testData/createTestResultData.mjs';

test('calculates capital', (t) => {
    const data = createTestResultData();
    const result = getTotalCapital(data.result);
    t.deepEqual(result, [
        [new Date(2019, 0, 1, 0, 0, 0).getTime(), 1000],
        [new Date(2019, 0, 2, 0, 0, 0).getTime(), 1002],
        [new Date(2019, 0, 3, 0, 0, 0).getTime(), 1006],
        [new Date(2019, 0, 4, 0, 0, 0).getTime(), 999],
        [new Date(2019, 0, 6, 0, 0, 0).getTime(), 998],
        [new Date(2019, 0, 7, 0, 0, 0).getTime(), 1002],
        [new Date(2019, 0, 8, 0, 0, 0).getTime(), 990],
    ]);
});
