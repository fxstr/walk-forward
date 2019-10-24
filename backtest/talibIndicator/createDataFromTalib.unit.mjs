import test from 'ava';
import createDataFromTalib from './createDataFromTalib.mjs';

test('re-formats data correctly', (t) => {
    const talibData = {
        row1: [2, 5, 3, 6],
        row2: [undefined, 4, 3, 1],
    };
    const outputMapping = { row1: 'newRow1', row2: 'newRow2' };
    const result = createDataFromTalib(talibData, [1, 2, 3, 4], 'aapl', outputMapping);
    t.deepEqual(result, [
        new Map([
            ['date', 1],
            ['instrument', 'aapl'],
            ['newRow1', 2],
            ['newRow2', undefined],
        ]),
        new Map([
            ['date', 2],
            ['instrument', 'aapl'],
            ['newRow1', 5],
            ['newRow2', 4],
        ]),
        new Map([
            ['date', 3],
            ['instrument', 'aapl'],
            ['newRow1', 3],
            ['newRow2', 3],
        ]),
        new Map([
            ['date', 4],
            ['instrument', 'aapl'],
            ['newRow1', 6],
            ['newRow2', 1],
        ]),
    ]);
});
