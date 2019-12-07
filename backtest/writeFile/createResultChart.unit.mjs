import test from 'ava';
import createResultChart from './createResultChart.mjs';
import createTestData from '../testData/createTestData.mjs';

test('works with empty results', (t) => {
    t.deepEqual(createResultChart(), { panel: new Map(), series: [] });
});

test('creates expected output', (t) => {
    const { data } = createTestData();
    const aaplInstructions = data.instructions.filter(({ instrument }) => instrument === 'aapl');
    aaplInstructions[0].selected = -1;
    aaplInstructions[0].weight = 2.5;
    aaplInstructions[0].rebalance = false;
    data.result = [{
        positionValues: new Map([['aapl', 3.5]]),
        orders: new Map([['aapl', -3]]),
        // Date must match date of timeSeries entries
        date: new Date(2019, 0, 1, 0, 0, 0).getTime(),
        positions: [{
            instrument: 'aapl',
            size: 5,
        }],
    }];

    const result = createResultChart(data.result, data.instructions, 'aapl');

    const createEntry = (day, value) => [new Date(2019, 0, day, 0, 0, 0).getTime(), value];
    const instructionsPanel = 'instructionsPanel';
    const resultPanel = 'resultPanel';
    const positionValuesPanel = 'positionValuesPanel';

    t.deepEqual(result, {
        series: [
            // Position Sizes
            {
                data: [createEntry(1, 5)],
                yAxis: resultPanel,
                type: 'column',
                name: 'Positions',
            },
            // Position Values
            {
                // First relative position value is always 1
                data: [createEntry(1, 1)],
                yAxis: positionValuesPanel,
                type: 'column',
                name: 'Relative Position Value',
            },
            // Orders
            {
                data: [createEntry(1, -3)],
                yAxis: resultPanel,
                lineWidth: 0,
                marker: {
                    enabled: true,
                    radius: 2,
                },
                name: 'Order Size',
                states: {
                    hover: {
                        lineWidthPlus: 0,
                    },
                },
            },
            // Selected
            {
                data: [
                    createEntry(1, -1),
                    createEntry(2, 0),
                    createEntry(4, 0),
                    createEntry(6, 0),
                    createEntry(7, 0),
                ],
                yAxis: instructionsPanel,
                type: 'line',
                name: 'Selected',
            },
            // Weight
            {
                data: [
                    createEntry(1, 2.5),
                    createEntry(2, 1),
                    createEntry(4, 1),
                    createEntry(6, 1),
                    createEntry(7, 1),
                ],
                yAxis: instructionsPanel,
                type: 'line',
                name: 'Weight',
            },
            // Rebalance
            {
                data: [
                    createEntry(1, 0),
                    createEntry(2, 1),
                    createEntry(4, 1),
                    createEntry(6, 1),
                    createEntry(7, 1),
                ],
                yAxis: instructionsPanel,
                type: 'line',
                name: 'Rebalance',
            },
        ],
        panel: new Map([
            [resultPanel, { height: 0.2 }],
            [instructionsPanel, { height: 0 }],
            [positionValuesPanel, { height: 0.2 }],
        ]),
    });
});

