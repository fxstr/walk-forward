import test from 'ava';
import executeOrders from './executeOrders.mjs';

test('works with no data', (t) => {
    const result = executeOrders(
        new Map(),
        new Map(),
        [],
        123,
    );
    t.deepEqual(result, {
        positions: [],
        cost: 0,
    });
});

test('creates positions', (t) => {
    const result = executeOrders(
        new Map([['test', 2]]),
        new Map([['test', 3]]),
        [],
        123,
    );
    t.deepEqual(result, {
        positions: [{
            size: 2,
            instrument: 'test',
            openDate: 123,
            openPrice: 3,
            marginPrice: 3,
        }],
        cost: 6,
    });
});

test('does not return closed positions', (t) => {
    const result = executeOrders(
        new Map([['test', -2]]),
        new Map([['test', 3]]),
        [{
            size: 2,
            instrument: 'test',
            openDate: 123,
            openPrice: 4,
            marginPrice: 4,
        }],
    );
    t.deepEqual(result, {
        positions: [],
        // Money is freed, cost is therefore negative
        cost: -6,
    });

});

test('updates positions', (t) => {
    const result = executeOrders(
        new Map([['test', 2]]),
        new Map([['test', 4]]),
        [{
            size: 2,
            instrument: 'test',
            openPrice: 3,
            openDate: 120,
            marginPrice: 2,
        }],
        123,
    );
    t.deepEqual(result, {
        positions: [{
            size: 4,
            instrument: 'test',
            openDate: 120,
            openPrice: 3.5,
            // 2@2, 2@4
            marginPrice: 3,
        }],
        cost: 8,
    });
});

test('works with negative sizes', (t) => {
    const result = executeOrders(
        new Map([['test', -1]]),
        new Map([['test', 4]]),
        [{
            size: -3,
            instrument: 'test',
            openPrice: 3,
            openDate: 120,
            marginPrice: 3,
        }],
        123,
    );
    t.deepEqual(result, {
        positions: [{
            size: -4,
            instrument: 'test',
            openDate: 120,
            openPrice: 3.25,
            marginPrice: 3.25,
        }],
        cost: 4,
    });
});

test('respects margin', (t) => {
    const result = executeOrders(
        new Map([['test', -1]]),
        new Map([['test', 4]]),
        [{
            size: -3,
            instrument: 'test',
            openPrice: 3,
            openDate: 120,
            marginPrice: 2,
        }],
        123,
        new Map([['test', 0.55]]),
    );
    t.deepEqual(result, {
        positions: [{
            size: -4,
            instrument: 'test',
            openDate: 120,
            openPrice: 3.25,
            // 1 @ 2.2, 3 @ 2 = 8.2 / 4
            marginPrice: 2.05,
        }],
        // Shorted 1 @ 0.55 * 4 (JS and numbers …)
        cost: 2.1999999999999993,
    });

});

