import test from 'ava';
import getSortedDataForInstrument from './getSortedDataForInstrument.mjs';

const setupData = () => {
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
    return { data, instrumentKey };
};

test('filters and sorts data', (t) => {
    const { data, instrumentKey } = setupData();
    const result = getSortedDataForInstrument(data, 'aapl');
    t.deepEqual(result, [
        new Map([
            ['date', 2],
            ['oldHigh', 7.23],
            ['oldLow', 7.11],
            [instrumentKey, 'aapl'],
        ]),
        new Map([
            ['date', 4],
            ['oldHigh', 7.12],
            ['oldLow', 7.02],
            ['otherField', 2.41],
            [instrumentKey, 'aapl'],
        ]),
    ]);
});
