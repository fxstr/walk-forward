import test from 'ava';
import addCapitalCurve from './addCapitalCurve.mjs';
import createTestResultData from '../testData/createTestResultData.mjs';
import createCapitalCurve from './createCapitalCurve.mjs';

test('adds to capital curve', (t) => {

    const emptyCurve = createCapitalCurve();
    const data = createTestResultData();
    const result = addCapitalCurve(emptyCurve, data, new Map([['param1', 1], ['param2', 2]]));

    // Takes an entry from backtestData.result, returns total capital (i.e. cash + all position
    // values on close)
    const getCapital = entry => entry.cash + entry.positions
        .filter(({ type }) => type === 'close')
        .reduce((sum, position) => sum + position.value, 0);

    t.deepEqual(result, {
        yAxis: [{
            height: '100%',
            id: 'capital',
        }],
        series: [{
            data: data.result.map(entry => [entry.date, getCapital(entry)]),
            type: 'line',
            name: 'param1: 1, param2: 2',
        }],
    });

    t.pass();
});
