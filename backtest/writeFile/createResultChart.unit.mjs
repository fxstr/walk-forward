import test from 'ava';
import createResultChart from './createResultChart.mjs';
import createTestResultData from '../testData/createTestResultData.mjs';

test('works with empty results', (t) => {
    t.deepEqual(createResultChart(), { panel: new Map(), series: [] });
});

test('creates expected output', (t) => {
    const data = createTestResultData();

    const result = createResultChart(data.result, data.instructions, 'aapl');

    const createEntry = (day, value) => [new Date(2019, 0, day, 0, 0, 0).getTime(), value];
    const instructionsPanel = 'instructionsPanel';
    const resultPanel = 'resultPanel';
    const positionValuesPanel = 'positionValuesPanel';


    t.deepEqual(result, {
        series: [
            // Position Sizes
            {
                data: [
                    createEntry(2, -56),
                    createEntry(3, -56),
                    createEntry(4, -56),
                    createEntry(6, 54),
                ],
                yAxis: resultPanel,
                type: 'column',
                name: 'Positions',
            },
            // Position Values
            {
                // First relative position value is always 1
                data: [
                    createEntry(2, (13.9 + 0.8) / 13.9),
                    createEntry(3, (13.9 + 0.8) / 13.9),
                    // JS fucks up rounding when we don't use 56
                    createEntry(4, (56 * (13.9 - 0.4)) / (56 * 13.9)),
                    createEntry(6, 13.6 / 13.4),
                ],
                yAxis: positionValuesPanel,
                type: 'column',
                name: 'Relative Position Value',
            },
            // Orders
            {
                data: [
                    createEntry(1, -56),
                    // Total money is 1044, invested ratio 0.9, weight of aapl is 2 (of 5)
                    // Makes (1044 * 0.9) * (2 / 5) = 375.84, close is 13.1 makes 28
                    createEntry(2, 28),
                    createEntry(4, 110),
                    // Close aapl
                    createEntry(6, -54),
                ],
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
                    createEntry(2, -1),
                    createEntry(4, 1),
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
                    createEntry(1, 2),
                    createEntry(2, 2),
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
                    createEntry(1, 1),
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

