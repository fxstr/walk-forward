import test from 'ava';
import calculatePositionValue from './calculatePositionValue.mjs';

test('calculates value correctly', (t) => {
    t.is(calculatePositionValue(5, 2, 2, 3), 15);
    t.is(calculatePositionValue(0, 2, 2, 3), 0);
    t.is(calculatePositionValue(-0, 2, 2, 3), 0);
    // Shorted 1 @ 2, up to 2, lost 1
    t.is(calculatePositionValue(-1, 2, 2, 3), 1);
    t.is(calculatePositionValue(-5, 2, 2, 3), 5);
    // Shorted 5 @2, is 6 now (lost 20)
    t.is(calculatePositionValue(-5, 2, 2, 6), -10);
});

test('works with margin', (t) => {
    // Got 5@2, is now 3 (gain 5), paid 1 (5 total)
    t.is(calculatePositionValue(5, 2, 1, 3), 10);
    // Got 5@2, is now 1 (lost 5), paid 0.5 (2.5 total)
    t.is(calculatePositionValue(5, 2, 0.5, 1), -2.5);
});

