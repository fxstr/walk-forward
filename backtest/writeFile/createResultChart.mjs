/**
 * Exports Highstock panel and series for results (positions, orders) and instructions (weight,
 * selected, trade).
 * @param {Object} results         See tradeForDate()
 * @param {Object} instructions    See createDefaultInstructions()
 * @param {string} instrumentName
 * @return {Object}                Object with properties
 *                                 - panel (Map)
 *                                 - series (Array)
 */
export default (results, instructions, instrumentName) => {

    // Make sure we return expected values when result is not yet available because trade()
    // has not been called.
    if (!results || !results.length) return { panel: new Map(), series: [] };

    // Get result data for current instrument; filter by dates that contain a position for the
    // given instrument
    const positionData = results
        .filter(({ positions }) => positions
            .find(position => position.instrument === instrumentName))
        .map(result => [
            result.date,
            // As all results were filtered by such ones with positions for the current instrument,
            // we can safely access its size.
            result.positions.find(position => position.instrument === instrumentName).size || 0,
        ]);

    const orderData = results
        .filter(({ orders }) => orders.has(instrumentName))
        .map(result => [
            result.date,
            result.orders.get(instrumentName) || 0,
        ]);


    const instructionDataForInstrument = instructions
        .filter(instruction => instruction.instrument === instrumentName);
    const weightData = instructionDataForInstrument
        .map(instruction => [instruction.date, instruction.weight]);
    const selectedData = instructionDataForInstrument.map(instruction => [
        instruction.date,
        instruction.selected,
    ]);
    const tradeData = instructionDataForInstrument.map(instruction => [
        instruction.date,
        instruction.trade ? 1 : 0,
    ]);

    const resultPanelName = 'resultPanel';
    const instructionsPanelName = 'instructionsPanel';

    return {
        panel: new Map([
            [
                resultPanelName, {
                    height: 0.2,
                },
            ],
            // Instructions don't need to be visible, we just want the tooltip; use height 0
            [
                instructionsPanelName, {
                    height: 0,
                },
            ]]),
        series: [
            // Positions
            {
                type: 'column',
                data: positionData,
                yAxis: resultPanelName,
                name: 'Positions',
            },
            // Orders
            {
                data: orderData,
                // Add orders to position panel
                yAxis: resultPanelName,
                name: 'Order Size',
                // Display dots only, see https://www.highcharts.com/stock/demo/markers-only
                lineWidth: 0,
                marker: {
                    enabled: true,
                    radius: 2,
                },
                states: {
                    hover: {
                        lineWidthPlus: 0,
                    },
                },
            },
            // Selected
            {
                data: selectedData,
                yAxis: instructionsPanelName,
                name: 'Selected',
                type: 'line',
            },
            // Weight
            {
                data: weightData,
                yAxis: instructionsPanelName,
                name: 'Weight',
                type: 'line',
            },
            // Trade
            {
                data: tradeData,
                yAxis: instructionsPanelName,
                name: 'Trade',
                type: 'line',
            },
        ],
    };

};
