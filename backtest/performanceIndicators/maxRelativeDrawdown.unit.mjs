import test from 'ava';
import maxRelativeDrawdown from './maxRelativeDrawdown.mjs';

test('calculates drawdown', (t) => {
    const capital = [[1, 50], [2, 48], [3, 55], [4, 44], [5, 48], [6, 50]];
    // Max dd is between 0.55 and 0.44 = 20%
    const maxDD = maxRelativeDrawdown(capital);
    t.is(maxDD > 0.1999, true);
    t.is(maxDD < 0.2, true);
});
