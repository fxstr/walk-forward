import test from 'ava';
import calculatePositionsValues from './calculatePositionsValues.mjs';

test('returns correct result', (t) => {
    const result = calculatePositionsValues(
        [{
            instrument: 'aapl',
            openPrice: 2,
            marginPrice: 2,
            size: 5,
        }, {
            instrument: 'amzn',
            openPrice: 3,
            marginPrice: 3,
            size: -4,
        }],
        new Map([
            ['aapl', 3],
            ['amzn', 3.5],
        ]),
    );
    t.is(result, (5 * 3) + (2.5 * 4));
});
