import executeOrders from './executeOrders.mjs';
import getPositionsValues from './getPositionsValues.mjs';
import createOrders from './createOrders.mjs';

/**
 * Executes trade for one certain date
 * @param  {number} date                          Date the trades are executed for
 * @param  {Map.<string, number>} openPrices      Open prices; key is the instrument's name, value
 *                                                the open price at date
 * @param  {Map.<string, number>} closePrices     Closing prices; key is the instrument's name,
 *                                                value the clsoing price at date
 * @param  {Object.<string, number>[]} instructionSet  Instructions for the given date; key is the
 *                                                instruction's name, value the instruction's value,
 *                                                e.g. [{ select, -1, weight: 5 }]
 * @param  {number} options.investedRatio         Ratio of the total amount of money available
 *                                                that should be invested
 * @param  {number} options.maxRatioPerInstrument Maximum ratio of the total amount of money
 *                                                available that should be invested in one single
 *                                                instrument
 * @param  {object} previous                      Trading results from the previous date; see return
 *                                                comment
 * @return {object}                               Object with the trading results for the current
 *                                                date
 */
export default (
    date,
    openPrices,
    closePrices,
    instructionSet,
    { investedRatio, maxRatioPerInstrument },
    previous,
) => {

    // Execute orders (in the morning, when only open prices are known)
    const { positions, unfulfilledOrders, cost } = executeOrders(
        // Use orders from previous close
        previous.orders,
        openPrices,
        // Pass in previous positions
        previous.positions,
        date,
    );
    const cash = previous.cash - cost;


    // Get values of all positions (in the evening when close prices are known); value is needed
    // to calculate orders for next day.
    const positionValues = getPositionsValues(
        positions,
        previous.positionValues,
        closePrices,
    );
    // Get total current value of all current positions
    const allPositionsValue = Array
        .from(positionValues.values())
        .reduce((prev, value) => prev + value, 0);

    // Map.<string, number> where key is the instrument name and value the current position size
    const currentPositions = new Map(positions.map(position =>
        [position.instrument, position.size]));

    // Create expected positions for next bar. Sizes are absolute (-28 means that we should be
    // 28 total short, not add another short position of 28).
    const newOrders = createOrders(
        instructionSet,
        closePrices,
        currentPositions,
        cash + allPositionsValue,
        investedRatio,
        maxRatioPerInstrument,
    );


    // To create orders, sizes must be relative; calculate size from difference between previous
    // and new positions.
    /* const newOrders = new Map(Array
        .from(newPositions.entries())
        .map(([instrument, size]) => [
            instrument,
            // Deduct size of existing position from new position size
            size - ((positions.find(existingPosition =>
                existingPosition.instrument === instrument) || {}).size || 0),
        ])
        // Remove orders witz size 0, there is nothing to execute
        .filter(([, size]) => size !== 0)); */


    // Orders should be valid until they are fulfilled (GTC). Therefore merge old unfulfilled
    // orders with new ones.
    const orders = new Map([
        ...unfulfilledOrders,
        ...newOrders,
    ]);


    return {
        date,
        positions,
        orders,
        positionValues,
        cash,
    };

};
