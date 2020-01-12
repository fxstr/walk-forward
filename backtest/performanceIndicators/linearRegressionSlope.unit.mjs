import test from 'ava';
import linearRegressionSlope from './linearRegressionSlope.mjs';

const getDate = (day, year = 2019) => new Date(year, 0, day, 0, 0, 0).getTime();

test('calculates for a single year', (t) => {
    // Growth is 1 per day, value on jan1 is 15; value at end of year is approx. 15 + 365 = 380
    // Growth rate is therefore (380 / 15) - 1 = 24.33
    const capital = [[getDate(1), 15], [getDate(2), 16], [getDate(4), 18]];
    const slope = linearRegressionSlope(capital);
    t.is(slope > 24.333, true);
    t.is(slope < 24.334, true);
});

test('calculates for multiple years', (t) => {
    // Growth in 1st year is 1 per day, in 2nd year 2 per day
    // Year 1: 15 + 365 = 380; rate is (380 / 15) - 1 = 24.333
    // Year 2: 15 + 730 = 745; rate is (745 / 15) - 1 = 48.666
    // Average is 36.5
    const capital = [
        [getDate(1), 15],
        [getDate(2), 16],
        [getDate(4), 18],
        [getDate(1, 2020), 15],
        [getDate(2, 2020), 17],
        [getDate(4, 2020), 21],
    ];
    const slope = linearRegressionSlope(capital);
    t.is(slope > 36.499, true);
    t.is(slope < 36.5, true);
});
