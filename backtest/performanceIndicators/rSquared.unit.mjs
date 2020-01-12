import test from 'ava';
import rSquared from './rSquared.mjs';

const getDate = (day, year = 2019) => new Date(year, 0, day, 0, 0, 0).getTime();

test('works with less than 1 year', (t) => {
    const capital = [[1, 1], [2, 2], [3, 3]];
    t.is(rSquared(capital), 1);
});

test('works with more than 1 year', (t) => {
    // R2 for 2019 is 1, for 2020 is 0; mean should be ~0.5
    const capital = [
        [getDate(1), 1],
        [getDate(2), 2],
        [getDate(3), 3],
        [getDate(1, 2020), 1],
        [getDate(2, 2020), 10],
        [getDate(3, 2020), 1],
    ];
    t.is(rSquared(capital) > 0.4999, true);
    t.is(rSquared(capital) < 0.5, true);
});

