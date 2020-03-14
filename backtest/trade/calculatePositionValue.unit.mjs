import test from 'ava';
import calculatePositionValue from './calculatePositionValue.mjs';

test('calculates value correctly', (t) => {
    t.is(calculatePositionValue(5, 2, 3), 15);
    t.is(calculatePositionValue(0, 2, 3), 0);
    t.is(calculatePositionValue(-0, 2, 3), 0);
    // Shorted 1 @ 2, up to 2, lost 1
    t.is(calculatePositionValue(-1, 2, 3), 1);
    t.is(calculatePositionValue(-5, 2, 3), 5);
    // Shorted 5 @2, is 6 now (lost 20)
    t.is(calculatePositionValue(-5, 2, 6), -10);
});

test('works with margin', (t) => {
    // Bought 5@2, is now 3 (gain 5), paid 1 (5 total)
    t.is(calculatePositionValue(5, 2, 3, 1), 10);
    // Bought 5@2, is now 1 (lost 5), paid 0.5 (2.5 total)
    t.is(calculatePositionValue(5, 2, 1, 0.5), -2.5);
    // Shorted 5@2, is now 1 (gained 5), paid 0.5 (2.5 total)
    t.is(calculatePositionValue(-5, 2, 1, 0.5), 7.5);
});

test('works with pointValues', (t) => {
    // Bought 5@2*0.5, is now 5@ 3*0.8; gain of 1.4 per contract – 5 * (3 * 0.8)
    t.is(calculatePositionValue(5, 2, 3, 2, 0.5, 0.8).toFixed(2), '12.00');
    // Shorted 5@2*0.5, is now at 3*0.8; lost 1.4 per contract
    t.is(calculatePositionValue(-5, 2, 3, 2, 0.5, 0.8).toFixed(2), '-2.00');
    // Point value and margin
    // Bought 5@2*0.5*0.5, is now at 3*0.8*0.5; gain of 0.7 per contract
    // Paid 5 * 0.5 * 0.5 * 2 = 2.5; gained 5 * 1.4 = 7; total is 9.5
    t.is(calculatePositionValue(5, 2, 3, 1, 0.5, 0.8).toFixed(2), '9.50');
});
