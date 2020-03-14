import test from 'ava';
import calculateCost from './calculateCost.mjs';

test('calculates and returns cost', (t) => {
    const previousPositions = [5, 7, -2].map(value => ({ value }));
    const currentPositions = [6, 3, 2, -2].map(value => ({ value }));
    t.is(calculateCost(currentPositions, previousPositions), 9 - 10);
});

