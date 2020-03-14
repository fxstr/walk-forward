import test from 'ava';
import createTestResultData from '../testData/createTestResultData.mjs';
import exportResult from './exportResult.mjs';

const createSeries = (name, data, yAxis = 'capital') => ({
    yAxis,
    type: 'area',
    name,
    fillOpacity: 1,
    stack: yAxis,
    data: [
        [new Date(2019, 0, 1).getTime(), data[0]],
        [new Date(2019, 0, 2).getTime(), data[1]],
    ],
});


test('exports data', (t) => {

    const data = createTestResultData();

    // Only test first two entries of result
    data.result = data.result.slice(0, 2);
    const result = exportResult()(data);

    // Compare JS objects (instead of stringified JSON) as were free to chose the object's order
    // this way
    t.deepEqual(JSON.parse(result), {
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
            createSeries('aapl', [0, 823.2]),
            // capital – amzn
            createSeries('amzn', [0, 0]),
            // capital – cash
            createSeries('cash', [1000, 221.60000000000002]),
            // pos sizes – aapl
            createSeries('aapl', [0, -56], 'positions'),
            // pos sizes – aapl
            createSeries('amzn', [0, 0], 'positions'),
            // capital - total capital
            {
                yAxis: 'capital',
                type: 'line',
                name: 'capital',
                data: [
                    [new Date(2019, 0, 1).getTime(), 1000],
                    [new Date(2019, 0, 2).getTime(), 1044.8000000000002],
                ],
            },
        ],
        plotOptions: {
            area: {
                stacking: 'normal',
            },
        },
    });

});
