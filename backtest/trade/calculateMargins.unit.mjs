import test from 'ava';
import calculateMargins from './calculateMargins.mjs';

const setupData = () => {
    const instrumentKey = Symbol('instrumentKey');
    const timeSeries = [
        new Map([
            [instrumentKey, 'inst1'],
            ['atr', 0.31],
            ['date', 123],
        ]),
        new Map([
            [instrumentKey, 'inst2'],
            ['atr', 0.27],
            ['date', 124],
        ]),
        new Map([
            [instrumentKey, 'inst1'],
            ['atr', 0.32],
            ['date', 124],
        ]),
    ];
    const getMargin = (instrumentName, entry) => entry.get('atr') || 1;
    return { timeSeries, instrumentKey, getMargin };
};


test('fails on invalid value', (t) => {
    const { timeSeries, instrumentKey } = setupData();
    t.throws(
        () => calculateMargins(timeSeries, instrumentKey, () => false),
        /is not a number but false/,
    );
});

test('is called with expected arguments', (t) => {
    const { timeSeries, instrumentKey } = setupData();
    const params = [];
    const getMargin = (...args) => {
        params.push(args);
        return 0.5;
    };
    calculateMargins(timeSeries, instrumentKey, getMargin);
    t.deepEqual(params, [
        ['inst1', timeSeries[0]],
        ['inst2', timeSeries[1]],
        ['inst1', timeSeries[2]],
    ]);
});

test('returns expected result', (t) => {
    const { timeSeries, instrumentKey, getMargin } = setupData();
    const result = calculateMargins(timeSeries, instrumentKey, getMargin);
    t.deepEqual(result, new Map([
        ['inst1', 0.31],
        ['inst2', 0.27],
        ['inst1', 0.32],
    ]));

});

