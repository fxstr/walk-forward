import test from 'ava';
import createOrders from './createOrders.mjs';

const createInstruction = (trade = true, selected = 1, instrument = 'test', weight = 1) => ({
    selected,
    trade,
    instrument,
    weight,
});

test('uses default values', (t) => {
    t.deepEqual(
        createOrders(
            [createInstruction()],
            new Map([['test', 2]]),
            100,
        ),
        new Map([['test', 50]]),
    );
});

test('rounds down', (t) => {
    t.deepEqual(
        createOrders(
            [createInstruction()],
            new Map([['test', 3]]),
            100,
        ),
        new Map([['test', 33]]),
    );
});

test('respects invested ratio', (t) => {
    t.deepEqual(
        createOrders(
            [createInstruction()],
            new Map([['test', 3]]),
            100,
            0.5,
        ),
        new Map([['test', 16]]),
    );
});

test('respects max amount per position', (t) => {
    t.deepEqual(
        createOrders(
            [createInstruction()],
            new Map([['test', 2]]),
            100,
            1,
            0.2,
        ),
        new Map([['test', 10]]),
    );
});

test('works with multiple instructions', (t) => {
    t.deepEqual(
        createOrders(
            [createInstruction(), createInstruction(true, -1, 'aapl', 2)],
            new Map([['test', 2], ['aapl', 3]]),
            100,
        ),
        new Map([['test', 16], ['aapl', -22]]),
    );
});

test('ignores non-selected', (t) => {
    t.deepEqual(
        createOrders(
            [createInstruction(true, 0)],
            new Map([['test', 2]]),
            100,
        ),
        new Map(),
    );
});

test('ignores non-trades', (t) => {
    t.deepEqual(
        createOrders(
            [createInstruction(false)],
            new Map([['test', 2]]),
            100,
        ),
        new Map(),
    );
});

test('works with negative orders', (t) => {
    t.deepEqual(
        createOrders(
            [createInstruction(true, -1)],
            new Map([['test', 2]]),
            100,
        ),
        new Map([['test', -50]]),
    );
});

test('works with 0 (does not divide by 0)', (t) => {
    t.deepEqual(
        createOrders(
            [createInstruction(true, -1, 'test', 0)],
            new Map([['test', 2]]),
            100,
        ),
        // Size is -0 because we multiply size of 0 with selected which is -1
        new Map([['test', -0]]),
    );
});
