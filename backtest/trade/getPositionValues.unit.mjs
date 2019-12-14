import test from 'ava';
import getPositionValues from './getPositionsValues.mjs';

test('calculates position value from current data', (t) => {
    const result = getPositionValues(
        [{
            size: 5,
            openPrice: 1,
            instrument: 'test',
            marginPrice: 1,
        }],
        new Map(),
        new Map([['test', 2]]),
    );
    t.deepEqual(result, new Map([['test', 10]]));
});

test('calculates position value from previous value if current price is missing', (t) => {
    const result = getPositionValues(
        [{
            size: 5,
            openPrice: 1,
            instrument: 'test',
            marginPrice: 1,
        }],
        new Map([['test', 22]]),
        new Map(),
    );
    t.deepEqual(result, new Map([['test', 22]]));
});

test('uses margin price', (t) => {
    const result = getPositionValues(
        [{
            size: 5,
            openPrice: 1,
            instrument: 'test',
            marginPrice: 0.5,
        }],
        new Map(),
        new Map([['test', 1.5]]),
    );
    // Bought 5 @ 1, now at 1.5; gain 0.5/instrument (2.5) + 2.5 price paid (50% of 5)
    t.deepEqual(result, new Map([['test', 5]]));
});

test('uses pointValue if provided', (t) => {
    const result = getPositionValues(
        [{
            size: 5,
            openPrice: 1,
            instrument: 'test',
            marginPrice: 1,
        }],
        new Map(),
        new Map([['test', 2.5]]),
        new Map([['test', 40]]),
    );
    // Bought 5 @ 1 (at 50% margin); is now at 2.5 x 40 = 100, gain 99/instrument
    t.deepEqual(result, new Map([['test', (5 * 99) + 5]]));
});

