import test from 'ava';
import getPositionValues from './getPositionsValues.mjs';

test('calculates position value from current data', (t) => {
    const result = getPositionValues(
        [{ size: 5, openPrice: 1, instrument: 'test' }],
        new Map(),
        new Map([['test', 2]]),
    );
    t.deepEqual(result, new Map([['test', 10]]));
});

test('calculates position value from previous value if current price is missing', (t) => {
    const result = getPositionValues(
        [{ size: 5, openPrice: 1, instrument: 'test' }],
        new Map([['test', 22]]),
        new Map(),
    );
    t.deepEqual(result, new Map([['test', 22]]));
});
