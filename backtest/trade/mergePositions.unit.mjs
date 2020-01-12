import test from 'ava';
import mergePositions from './mergePositions.mjs';

const createPosition = (size = 10, openPrice = 2, openDate = 123, marginPrice = openPrice) => ({
    size,
    openPrice,
    openDate,
    instrument: 'instr',
    marginPrice,
});

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
        mergePositions(createPosition(0), createPosition(10, 2.2, 124)),
        createPosition(10, 2.2, 124),
    );
    t.deepEqual(
        mergePositions(createPosition(0), createPosition(-10, 2.2, 124)),
        createPosition(-10, 2.2, 124),
    );
});

test('enlarges position in both directions', (t) => {
    t.deepEqual(
        mergePositions(createPosition(), createPosition(5, 2.3, 124)),
        createPosition(15, 2.1),
    );
    t.deepEqual(
        mergePositions(createPosition(-10), createPosition(-5, 2.3, 124)),
        createPosition(-15, 2.1),
    );
});

test('reduces position in both directions', (t) => {
    t.deepEqual(
        mergePositions(createPosition(), createPosition(-5, 2.7, 124)),
        createPosition(5, 2, 123),
    );
    t.deepEqual(
        mergePositions(createPosition(-10), createPosition(5, 2.7, 124)),
        createPosition(-5, 2, 123),
    );
});

test('reduces to 0 in both directions', (t) => {
    t.deepEqual(
        mergePositions(createPosition(), createPosition(-10, 2, 125)),
        createPosition(0, 2, 123),
    );
    t.deepEqual(
        mergePositions(createPosition(-10), createPosition(10, 2, 125)),
        createPosition(0, 2, 123),
    );
});

test('works with margin different than openPrice', (t) => {
    t.deepEqual(
        mergePositions(createPosition(), createPosition(5, 2, 124, 1.1)),
        createPosition(15, 2, 123, 1.7),
    );
});

test('works with more than 2 arguments', (t) => {
    t.deepEqual(
        // mergePositions(a, b, c) = mergePositions(mergePositions(a, b), c)
        mergePositions(createPosition(), createPosition(-10, 2.2), createPosition(12, 2.5, 124)),
        mergePositions(
            mergePositions(createPosition(), createPosition(-10, 2.2)),
            createPosition(12, 2.5, 124),
        ),
    );
});
