import test from 'ava';
import updatePosition from './updatePosition.mjs';
import createPosition from './createPosition.mjs';

test('works without optional arguments', (t) => {
    const position = createPosition('a', 10, 5);
    const newPosition = updatePosition(position);
    t.deepEqual(newPosition, position);

    const closingPosition = createPosition('a', 10, 5);
    const newClosingPosition = updatePosition(closingPosition, true);
    t.deepEqual(newClosingPosition, {
        ...position,
        type: 'close',
    });
});

test('updates price', (t) => {
    const position = createPosition('a', 10, 5);
    const newPosition = updatePosition(position, false, 6);
    t.deepEqual(newPosition, {
        ...position,
        value: 60,
        created: {
            ...position.created,
            barsSince: 1,
        },
    });
});

test('respects pointValue', (t) => {
    const position = createPosition('a', 10, 5, 5, 0.5);
    const newPosition = updatePosition(position, false, 6, 0.8);
    t.deepEqual(newPosition, {
        ...position,
        // Bought 10@5 * 0.5, is now at 6 * 0.8 = 48
        value: 48.00000000000001,
        created: {
            ...position.created,
            barsSince: 1,
        },
    });
});

// Update created shit
test('updates size', (t) => {
    t.pass();
});

test('does not modify original position', (t) => {
    const position = createPosition('a', 10, 5);
    updatePosition(position, false, 6, 2, 5);
    t.deepEqual(position, createPosition('a', 10, 5));
});
