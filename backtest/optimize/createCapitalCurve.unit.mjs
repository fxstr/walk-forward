import test from 'ava';
import createCapitalCurve from './createCapitalCurve.mjs';

test('creates template', (t) => {
    t.deepEqual(createCapitalCurve(), {
        yAxis: [{
            height: '100%',
            id: 'capital',
        }],
        series: [],
    });
});
