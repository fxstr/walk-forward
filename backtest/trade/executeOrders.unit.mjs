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


test('creates (multiple) positions', (t) => {
    const result = executeOrders(
        // Orders
        new Map([['test', 2], ['test2', -1]]),
        // Open prices
        new Map([['test', 3], ['test2', 2]]),
        // Current orders
        [],
        // Date
        123,
    );
    t.deepEqual(result, {
        positions: [{
            size: 2,
            instrument: 'test',
            openDate: 123,
            openPrice: 3,
            marginPrice: 3,
        }, {
            size: -1,
            instrument: 'test2',
            openDate: 123,
            openPrice: 2,
            marginPrice: 2,
        }],
        cost: 8,
    });
});


/* test('closed positions have size 0 and are removed afterwards', (t) => {
    // Closing position
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
        124,
    );
    t.deepEqual(result, {
        positions: [{
            instrument: 'test',
            size: 0,
            openDate: 123,
            openPrice: 3,
            marginPrice: 3,
        }],
        // Money is freed, cost is therefore negative
        cost: -6,
    });

    // If size is 0 for 2 consecutive bars, remove order completely
    const resultWithoutPosition = executeOrders(
        new Map([['test', 0]]),
        new Map([['test', 3]]),
        [{
            size: 0,
            instrument: 'test',
            openDate: 123,
            openPrice: 4,
            marginPrice: 4,
        }],
        124,
    );
    t.deepEqual(resultWithoutPosition, {
        positions: [],
        // Money is freed, cost is therefore negative
        cost: 0,
    });

}); */

 test('closed positions are removed', (t) => {
    // Closing position
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
        124,
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
        // Orders
        new Map([['test', -1]]),
        // Open prices
        new Map([['test', 4]]),
        // Position
        [{
            size: -3,
            instrument: 'test',
            openPrice: 3,
            openDate: 120,
            marginPrice: 3,
        }],
        // Date
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
        // Orders
        new Map([['test', -1]]),
        // Open prices
        new Map([['test', 4]]),
        // Position
        [{
            size: -3,
            instrument: 'test',
            openPrice: 3,
            openDate: 120,
            marginPrice: 2,
        }],
        // Date
        123,
        // Margin
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


test('respects pointValue', (t) => {
    const result = executeOrders(
        // Orders
        new Map([['test', -2]]),
        // Open prices
        new Map([['test', 4]]),
        // Existing positions
        [],
        // Date
        123,
        // Margin
        undefined,
        // pointValue
        new Map([['test', 40]]),
    );
    t.deepEqual(result, {
        positions: [{
            size: -2,
            instrument: 'test',
            openDate: 123,
            openPrice: 160,
            marginPrice: 160,
        }],
        cost: 320,
    });

});

