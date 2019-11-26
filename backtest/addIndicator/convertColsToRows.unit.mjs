import test from 'ava';
import convertColsToRows from './convertColsToRows.mjs';
import createTestData from '../testData/createTestData.mjs';

test('adds row for every columnName', (t) => {
    const { data } = createTestData();
    const result = convertColsToRows(data.timeSeries, data.instrumentKey, ['open', 'close']);
    t.is(result.size, 2);
    t.deepEqual(result.get('aapl'), new Map([
        ['open', [13.2, 13.9, 14.1, 13.4, 13.4]],
        ['close', [14.1, 13.1, 14.3, 13.6, 13.1]],
    ]));
});

test('creates fields for all columNames', (t) => {
    const result = convertColsToRows([new Map([['key', 'instrument']])], 'key', ['inexistent']);
    t.deepEqual(result.get('instrument'), new Map([['inexistent', [undefined]]]));
});

test('works with empty data', (t) => {
    const result = convertColsToRows([], 'key', ['test']);
    t.deepEqual(result, new Map());
});
