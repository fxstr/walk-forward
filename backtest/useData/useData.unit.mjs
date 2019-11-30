import test from 'ava';
import useData from './useData.mjs';

test('fails if date is missing', (t) => {
    const noDate = new Map([['instrument', [new Map([['field', 'content']])]]]);
    t.throws(() => useData(new Map(), noDate), /Every row must contain a property 'date'/);
    const invalidDate = new Map([['instrument', [new Map([['date', 'NaN']])]]]);
    t.throws(() => useData(new Map(), invalidDate), /Every row must contain a property 'date'/);
});

test('fails if date is duplicate', (t) => {
    const fetch = new Map([['instrument', [
        new Map([['date', 2]]),
        new Map([['date', 2]]),
    ]]]);
    t.throws(() => useData(new Map(), fetch), /Date 2 is a duplicate/);
});

test('returns correctly formatted data', (t) => {
    const fetch = new Map([
        ['aapl', [
            new Map([['date', 1], ['open', 2.12]]),
            new Map([['date', 2], ['open', 2.27]]),
        ]],
        ['amzn', [
            new Map([['date', 1], ['open', 3.27]]),
            new Map([['date', 3], ['open', 4.02]]),
        ]],
    ]);
    const data = useData(new Map(), fetch);

    // Main structure
    t.deepEqual(Object.keys(data), [
        'instruments',
        'instrumentKey',
        'timeSeries',
        'instructions',
        'instructionFunctions',
        'viewOptions',
        'result',
        'configuration',
    ]);

    // instruments
    t.deepEqual(data.instruments, new Set(['aapl', 'amzn']));

    // instrumentKey
    t.is(typeof data.instrumentKey === 'symbol', true);

    // timeSeries – sorted by date/instrument
    t.deepEqual(data.timeSeries, [new Map([
        ['date', 1],
        ['open', 2.12],
        [data.instrumentKey, 'aapl'],
    ]), new Map([
        ['date', 1],
        ['open', 3.27],
        [data.instrumentKey, 'amzn'],
    ]), new Map([
        ['date', 2],
        ['open', 2.27],
        [data.instrumentKey, 'aapl'],
    ]), new Map([
        ['date', 3],
        ['open', 4.02],
        [data.instrumentKey, 'amzn'],
    ])]);

    // instructions (see createDefaultInstructions for detailed tests)
    t.deepEqual(data.instructions, []);
    t.deepEqual(data.instructionFunctions, []);

    // viewOptions
    t.deepEqual(data.viewOptions, {});

    // Config: Is an object
    t.is(data.configuration.constructor, Object);

    // Results
    t.deepEqual(data.result, {});

});

