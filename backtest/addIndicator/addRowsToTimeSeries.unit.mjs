import test from 'ava';
import addRowsToTimeSeries from './addRowsToTimeSeries.mjs';
import createTestData from '../testData/createTestData.mjs';

test('throws on missing instrument data', (t) => {
    const rowBasedData = new Map([['instr', new Map()]]);
    const timeSeries = [new Map([['key', 'otherInstr']])];
    t.throws(
        () => addRowsToTimeSeries(rowBasedData, timeSeries, 'key'),
        /contains data for instrument instr/,
    );
});

test('throws on different lengths', (t) => {
    const rowBasedData = new Map([['instr', new Map([['open', [1, 2]]])]]);
    const timeSeries = [new Map([['key', 'instr']])];
    t.throws(
        () => addRowsToTimeSeries(rowBasedData, timeSeries, 'key'),
        /Row based data for row open/,
    );
});

test('updates data', (t) => {
    const { data } = createTestData();
    const rowBasedData = new Map([
        [
            'aapl',
            new Map([['new', [1, 2, 3, 4, 5]]]),
        ], [
            'amzn',
            new Map([['new', [1, 2, 3]]]),
        ],
    ]);
    const merged = addRowsToTimeSeries(rowBasedData, data.timeSeries, data.instrumentKey);
    // First entry
    t.deepEqual(
        merged[0],
        new Map([...data.timeSeries[0], ['new', 1]]),
    );
    // Last entry
    t.deepEqual(
        merged[7],
        new Map([...data.timeSeries[7], ['new', 5]]),
    );
    // Same size
    t.is(merged.size, data.timeSeries.size);
});

test('works if row-based data does not exit for all instruments', (t) => {
    const { data } = createTestData();
    // No data for amzn
    const rowBasedData = new Map([[
        'aapl',
        new Map([['new', [1, 2, 3, 4, 5]]]),
    ]]);
    const merged = addRowsToTimeSeries(rowBasedData, data.timeSeries, data.instrumentKey);
    // First entry
    t.deepEqual(
        merged[0],
        new Map([...data.timeSeries[0], ['new', 1]]),
    );
    // First amzn entry
    t.deepEqual(merged[2], data.timeSeries[2]);
    t.is(merged.size, data.timeSeries.size);
});


test('does not modify original data', (t) => {
    const { data } = createTestData();
    const firstOriginalEntry = new Map(data.timeSeries[0]);
    const rowBasedData = new Map([
        [
            'aapl',
            new Map([['new', [1, 2, 3, 4, 5]]]),
        ],
    ]);
    addRowsToTimeSeries(rowBasedData, data.timeSeries, data.instrumentKey);
    t.deepEqual(data.timeSeries[0], firstOriginalEntry);

});

