import test from 'ava';
import calculatePositionValue from './calculatePositionValue.mjs';

test('calculates value correctly', (t) => {
    t.is(calculatePositionValue(5, 2, 3), 15);
    t.is(calculatePositionValue(0, 2, 3), 0);
    t.is(calculatePositionValue(-0, 2, 3), 0);
    t.is(calculatePositionValue(-1, 2, 3), 1);
    t.is(calculatePositionValue(-5, 2, 3), 5);
});
