import calculatePositionValue from '../trade/calculatePositionValue.mjs';

/**
 * Exports results (positions, orders) and instructions(weight, selected, trade) for an instrument
 * as a Highstock chart.
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
    const positionForInstrument = results
        .map(result => [
            result.date,
            // Use close type as positions have not been modified on open
            result.positions.find(({ instrument, type }) => instrument === instrumentName
                && type === 'close'),
        ])
        // Remove all positions without data for the current instrument
        .filter(([, position]) => !!position);


    const positionSizes = positionForInstrument.map(([date, { size }]) => [date, size]);

    const positionValues = positionForInstrument
        .map(([date, position]) => [
            date,
            // Calculate original price (for current size) based on position data
            position.value / calculatePositionValue(
                position.size,
                position.created.price,
                position.created.price,
                position.created.marginPrice,
                position.created.pointValue,
                position.created.pointValue,
            ),
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
    const rebalanceData = instructionDataForInstrument.map(instruction => [
        instruction.date,
        instruction.rebalance ? 1 : 0,
    ]);

    const resultPanelName = 'resultPanel';
    const instructionsPanelName = 'instructionsPanel';
    const positionValuesPanelName = 'positionValuesPanel';

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
            ],
            [
                positionValuesPanelName, {
                    height: 0.2,
                },
            ]]),
        series: [
            // Position size
            {
                type: 'column',
                data: positionSizes,
                yAxis: resultPanelName,
                name: 'Positions',
            },
            // Position values
            {
                type: 'column',
                // step: true,
                data: positionValues,
                yAxis: positionValuesPanelName,
                name: 'Relative Position Value',
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
            // Rebalance
            {
                data: rebalanceData,
                yAxis: instructionsPanelName,
                name: 'Rebalance',
                type: 'line',
            },
        ],
    };

};
