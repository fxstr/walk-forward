import test from 'ava';
import findInTimeSeries from './findInTimeSeries.mjs';

const setupData = () => {
    const instrumentKey = Symbol('instrumentKey');
    return {
        instrumentKey,
        timeSeries: [new Map([
            [instrumentKey, 'aapl'],
            ['date', 1],
            ['value', 1],
        ]), new Map([
            [instrumentKey, 'amzn'],
            ['date', 2],
            ['value', 2],
        ]), new Map([
            [instrumentKey, 'aapl'],
            ['date', 1],
            ['value', 3],
        ])],
    };
};

test('finds first result', (t) => {
    const data = setupData();
    t.deepEqual(findInTimeSeries(data, 'aapl', 1), new Map([
        [data.instrumentKey, 'aapl'],
        ['date', 1],
        ['value', 1],
    ]));
});

test('returns undefined if no match was found', (t) => {
    t.is(findInTimeSeries(setupData(), 'amzn', 1), undefined);
});
