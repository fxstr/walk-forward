import test from 'ava';
import getPointValuesForDate from './getPointValuesForDate.mjs';

test('works', (t) => {
    const instruments = ['aapl', 'amzn'];
    const pointValueFunction = (instrument, date) => {
        if (date === 1 && instrument === 'aapl') return 3;
        if (date === 1 && instrument === 'amzn') return 4;
        return 0;
    };
    t.deepEqual(getPointValuesForDate(instruments, pointValueFunction, 1), new Map([
        ['aapl', 3],
        ['amzn', 4],
    ]));
});
