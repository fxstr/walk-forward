import test from 'ava';
import createOrders from './createOrders.mjs';

test('creates orders', (t) => {
    const expected = new Map([['aapl', 5], ['amzn', 2]]);
    const current = new Map([['aapl', 10], ['amzn', -5]]);
    const result = createOrders(expected, current);
    t.deepEqual(result, new Map([['aapl', -5], ['amzn', 7]]));
});

test('works with missing current orders', (t) => {
    const expected = new Map([['aapl', 5]]);
    const current = new Map();
    const result = createOrders(expected, current);
    t.deepEqual(result, new Map([['aapl', 5]]));
});

test('removes orders with size 0', (t) => {
    const expected = new Map([['aapl', 5]]);
    const current = new Map([['aapl', 5]]);
    const result = createOrders(expected, current);
    t.deepEqual(result, new Map());
});
