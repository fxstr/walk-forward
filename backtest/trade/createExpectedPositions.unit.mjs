import test from 'ava';
import createExpectedPositions from './createExpectedPositions.mjs';

const createInstruction = (trade = true, selected = 1, instrument = 'test', weight = 1) => ({
    selected,
    trade,
    instrument,
    weight,
});

test('uses default values', (t) => {
    t.deepEqual(
        createExpectedPositions(
            [createInstruction()],
            new Map([['test', 2]]),
            100,
            100,
        ),
        new Map([['test', 50]]),
    );
});

test('rounds down', (t) => {
    t.deepEqual(
        createExpectedPositions(
            [createInstruction()],
            new Map([['test', 3]]),
            100,
            100,
        ),
        new Map([['test', 33]]),
    );
});

test('respects max amount per position', (t) => {
    t.deepEqual(
        createExpectedPositions(
            [createInstruction()],
            new Map([['test', 2]]),
            100,
            20,
        ),
        new Map([['test', 10]]),
    );
});

test('works with multiple instructions', (t) => {
    t.deepEqual(
        createExpectedPositions(
            [
                createInstruction(),
                createInstruction(true, -1, 'aapl', 2),
            ],
            new Map([['test', 2], ['aapl', 3]]),
            100,
            100,
        ),
        // aapl gets 2x the amount of money = 66.6 @ 3 = -22 pos; test gets 33.3 @ 2 = 16
        new Map([['test', 16], ['aapl', -22]]),
    );
});

test('creates canceling position if selected is 0', (t) => {
    t.deepEqual(
        createExpectedPositions(
            [createInstruction(true, 0, 'cancelTest')],
            new Map([['cancelTest', 2]]),
            100,
            100,
        ),
        new Map([['cancelTest', 0]]),
    );
});

test('works with negative orders', (t) => {
    t.deepEqual(
        createExpectedPositions(
            [createInstruction(true, -1)],
            new Map([['test', 2]]),
            100,
            100,
        ),
        new Map([['test', -50]]),
    );
});

test('works with weight 0 (does not divide by 0)', (t) => {
    t.deepEqual(
        createExpectedPositions(
            [createInstruction(true, -1, 'test', 0)],
            new Map([['test', 2]]),
            100,
            100,
        ),
        // Size is -0 because we multiply size of 0 with selected which is -1
        new Map([['test', -0]]),
    );
});


test('works with pointValues', (t) => {
    t.deepEqual(
        createExpectedPositions(
            [createInstruction(true, -1, 'test')],
            new Map([['test', 2]]),
            1000,
            1000,
            new Map([['test', 40]]),
        ),
        // 1000 total, 1 test costs 40 * 2 = 80, makes 12.5
        new Map([['test', -12]]),
    );
});


test('does not create position if instructionFieldPrice is not available', (t) => {
    t.deepEqual(
        createExpectedPositions(
            [createInstruction(true, -1, 'test')],
            new Map([['test', undefined]]),
            1000,
            1000,
        ),
        new Map(),
    );
});


test('does not reserve money for selected 0', (t) => {
    t.deepEqual(
        createExpectedPositions(
            [
                // No money is reserved for this position that will be closed
                createInstruction(true, 0, 'unselected'),
                createInstruction(true, 1, 'test'),
            ],
            new Map([['test', 17], ['unselected', 3]]),
            1000,
            1000,
        ),
        // 1000 total, unselected is not traded; test costs 17 → 58
        new Map([['unselected', 0], ['test', 58]]),
    );
});


