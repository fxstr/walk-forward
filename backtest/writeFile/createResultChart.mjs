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
    const positionSizes = results
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


    // Get relative position values; base is the *close* price of the first bar the position was
    // created (1.0). Subsequent *close* prices (see tradeForDate) set in relation to it.
    const positionValues = results
        .reduce((previous, result) => {
            const latest = previous.slice(-1).pop() || {};
            // Get current position value
            const currentValue = result.positionValues.get(instrumentName);
            // Get position (to get size); we divide the position value by the position size so
            // that relativeValue does not grow when positions are enlarged.
            const currentPosition = result.positions
                .find(position => position.instrument === instrumentName);
            const currentPositionSize = (currentPosition && currentPosition.size) || 0;
            const positionValueAdjustedForSize = currentValue / currentPositionSize;
            let relativeValue;
            if (currentPositionSize === 0) {
                relativeValue = 0;
            }
            // Start with relativeValue 1 if we just opened the position in the current direction
            else if (Math.sign(latest.adjustedAbsoluteValue) !== Math.sign(positionValueAdjustedForSize)) {
                relativeValue = 1;
            }
            // Use relative value if position was already open
            else {
                relativeValue = latest.relativeValue *
                    (positionValueAdjustedForSize / latest.adjustedAbsoluteValue);
            }
            return [...previous, {
                date: result.date,
                relativeValue,
                adjustedAbsoluteValue: positionValueAdjustedForSize,
            }];
        }, [])
        .map(result => [
            result.date,
            result.relativeValue,
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
