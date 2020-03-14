import test from 'ava';
import executeOrders from './executeOrders.mjs';
import createPosition from './createPosition.mjs';


test('works with no data', (t) => {
    const result = executeOrders(
        new Map(),
        new Map(),
        [],
        123,
    );
    t.deepEqual(result, []);
});


test('creates (multiple) positions', (t) => {
    const result = executeOrders(
        // Orders
        new Map([['test', 2], ['test2', -1]]),
        // Open prices
        new Map([['test', 3], ['test2', 2]]),
    );
    t.deepEqual(result, [
        createPosition('test', 2, 3, 3),
        createPosition('test2', -1, 2, 2),
    ]);
});


test('does not create orders if open is missing', (t) => {
    const result = executeOrders(
        new Map([['a', 2], ['b', 3]]),
        new Map([['a', 5]]),
    );
    t.deepEqual(result, [createPosition('a', 2, 5, 5)]);
});

test('respects relative margin', (t) => {
    const result = executeOrders(
        new Map([['a', 2]]),
        new Map([['a', 5]]),
        new Map([['a', 0.5]]),
    );
    t.deepEqual(result, [createPosition('a', 2, 5, 2.5)]);
});

test('respects pointValue', (t) => {
    const result = executeOrders(
        new Map([['a', 2]]),
        new Map([['a', 5]]),
        new Map([['a', 0.5]]),
        // Assume contract size 10 (or exchange rate 10)
        new Map([['a', 10]]),
    );
    t.deepEqual(result, [createPosition('a', 2, 5, 2.5, 10)]);
});


