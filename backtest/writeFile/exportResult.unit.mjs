import test from 'ava';
import exportResult from './exportResult.mjs';

const createSeries = (name, data, yAxis = 'capital') => ({
    yAxis,
    type: 'area',
    name,
    fillOpacity: 1,
    stack: yAxis,
    data: [[120, data[0]], [121, data[1]]],
});

test('exports data', (t) => {

    const data = {
        instruments: new Set(['aapl', 'amzn']),
        result: [{
            cash: 3,
            date: 120,
            positionValues: new Map([['amzn', 3]]),
            positions: [{
                instrument: 'amzn',
                size: 5,
            }],
        }, {
            cash: 5,
            date: 121,
            positionValues: new Map([['aapl', 2], ['amzn', 4]]),
            positions: [{
                instrument: 'aapl',
                size: 2,
            }],
        }],
    };
    const result = exportResult()(data);
    t.deepEqual(result, {
        title: 'Result',
        yAxis: [{
            height: '70%',
            id: 'capital',
        }, {
            top: '70%',
            height: '30%',
            id: 'positions',
        }],
        series: [
            // capital – aapl
            createSeries('aapl', [0, 2]),
            // capital – amzn
            createSeries('amzn', [3, 4]),
            // capital – cash
            createSeries('cash', [3, 5]),
            // pos sizes – aapl
            createSeries('aapl', [0, 2], 'positions'),
            // pos sizes – aapl
            createSeries('amzn', [5, 0], 'positions'),
        ],
        plotOptions: {
            area: {
                stacking: 'normal',
            },
        },
    });

});
