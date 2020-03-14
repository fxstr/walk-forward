import test from 'ava';
import mergePositions from './mergePositions.mjs';
import createPosition from './createPosition.mjs';

const setupData = (size = 10, openPrice = 2, marginPrice = openPrice, pointValue = 1, value) => {
    const position = createPosition('instr', size, openPrice, marginPrice, pointValue);
    return {
        ...position,
        value: value !== undefined ? value : position.value,
    };
};

test('throws if instruments differ', (t) => {
    t.throws(
        () => mergePositions({ instrument: 'a' }, { instrument: 'b' }),
        /positions you try to merge differ/,
    );
});

test('executes with none or one order', (t) => {
    t.is(mergePositions(), undefined);
    t.deepEqual(mergePositions(createPosition()), createPosition());
});

test('executes with previous size 0', (t) => {
    t.deepEqual(
        mergePositions(setupData(0), setupData(10, 2.2)),
        setupData(10, 2.2),
    );
    t.deepEqual(
        mergePositions(setupData(0), setupData(-10, 2.2)),
        setupData(-10, 2.2),
    );
});

test('enlarges position in both directions', (t) => {
    t.deepEqual(
        mergePositions(setupData(), setupData(5, 2.3)),
        // Value: Bought 10@2, now at 2.3 = 23
        // Added 5@2.3 = 11.5
        setupData(15, 2.1, undefined, undefined, 34.49999999999999),
    );
    t.deepEqual(
        mergePositions(setupData(-10), setupData(-5, 2.3)),
        // Value: Shorted 10@2, now at 2.3 = 17
        // Added 5@2.3 = 11.5
        setupData(-15, 2.1, undefined, undefined, 28.500000000000004),
    );
});

test('reduces position in both directions', (t) => {
    t.deepEqual(
        mergePositions(setupData(), setupData(-5, 2.7)),
        setupData(5, 2, undefined, undefined, 5 * 2.7),
    );
    t.deepEqual(
        mergePositions(setupData(-10), setupData(5, 2.7)),
        // Value: Shorted 10@2, now@2.7 = 13
        setupData(-5, 2, undefined, undefined, 6.499999999999999),
    );
});

test('reduces to 0 in both directions', (t) => {
    t.deepEqual(
        mergePositions(setupData(), setupData(-10, 2)),
        setupData(0, 2, undefined, undefined, 0),
    );
    t.deepEqual(
        mergePositions(setupData(-10), setupData(10, 2)),
        setupData(0, 2, undefined, undefined, 0),
    );
});

test('works with margin different than openPrice', (t) => {
    const initialPrice = ((2 * 10) + (2.2 * 5)) / 15;
    t.deepEqual(
        mergePositions(setupData(), setupData(5, 2.2, 1.1)),
        // Value: Bought 10@2, now at 2.2 = 22; add 5@22 for 1.1 = 5.5
        setupData(15, initialPrice, 1.7, undefined, 27.5),
    );
});

test('works with more than 2 arguments', (t) => {
    t.deepEqual(
        // mergePositions(a, b, c) = mergePositions(mergePositions(a, b), c)
        mergePositions(setupData(), setupData(-10, 2.2), setupData(12, 2.5)),
        mergePositions(
            mergePositions(setupData(), setupData(-10, 2.2)),
            setupData(12, 2.5),
        ),
    );
});

test('creates a new position if direction changes', (t) => {
    t.deepEqual(
        mergePositions(setupData(), setupData(-12, 2.2)).created.barsSince,
        0,
    );
});

test('takes previous barsSince if position is updated', (t) => {
    const originalPosition = setupData();
    originalPosition.created.barsSince = 20;
    const result = mergePositions(originalPosition, setupData(5, 2.2, 1.1));
    t.is(result.created.barsSince, 20);
});

test('works with pointValue', (t) => {
    // Position is enlarged
    t.deepEqual(
        mergePositions(
            setupData(undefined, undefined, undefined, 0.5),
            setupData(5, 2, undefined, 0.8),
        ),
        // Value: 10 * 2 + 5 * 0.8 = 24
        setupData(15, 2, undefined, 0.6000000000000001, 24),
    );
    // Position is closed
    t.deepEqual(
        mergePositions(
            setupData(undefined, undefined, undefined, 0.5),
            setupData(-10, 2, undefined, 0.8),
        ),
        setupData(0, 2, undefined, 0.5, 0),
    );
    // Position is reduced
    t.deepEqual(
        mergePositions(
            setupData(undefined, undefined, undefined, 0.5),
            setupData(-5, 2, undefined, 0.8),
        ),
        // Value: 5 * 2 * 0.8
        setupData(5, 2, undefined, 0.5, 8),
    );
});


