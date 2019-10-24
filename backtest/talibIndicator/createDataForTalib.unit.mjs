import test from 'ava';
import createDataForTalib from './createDataForTalib.mjs';

test('creates correct data', (t) => {
    const instrumentKey = Symbol('instrumentKey');
    const data = {
        instrumentKey,
        // Test for
        // - unnecessary fields
        // - other instruments
        // - wrong sort order
        timeSeries: [new Map([
            ['date', 4],
            ['oldHigh', 7.12],
            ['oldLow', 7.02],
            ['otherField', 2.41],
            [instrumentKey, 'aapl'],
        ]), new Map([
            ['date', 3],
            [instrumentKey, 'amzn'],
        ]), new Map([
            ['date', 2],
            ['oldHigh', 7.23],
            ['oldLow', 7.11],
            [instrumentKey, 'aapl'],
        ])],
    };
    const result = createDataForTalib(data, 'aapl', { high: 'oldHigh', low: 'oldLow' });
    t.deepEqual(result, {
        high: [7.23, 7.12],
        low: [7.11, 7.02],
    });

});
