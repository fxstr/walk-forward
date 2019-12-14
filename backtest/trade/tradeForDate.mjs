import executeOrders from './executeOrders.mjs';
import getPositionsValues from './getPositionsValues.mjs';
import createExpectedPositions from './createExpectedPositions.mjs';
import getTradableAmount from './getTradableAmount.mjs';
import getAmounts from './getAmounts.mjs';
import createOrders from './createOrders.mjs';
import filterRebalances from './filterRebalances.mjs';

/**
 * Executes trade for one certain date
 * @param {number} date                           Date the trades are executed for
 * @param {Map.<string, number>} openPrices       Open prices; key is the instrument's name, value
 *                                                the open price at date
 * @param {Map.<string, number>} closePrices      Closing prices; key is the instrument's name,
 *                                                value the clsoing price at date
 * @param {Map.<string, number>} instructionFieldPrices      Prices used to calculate order size
 * @param {Object.<string, number>[]} instructionSet  Instructions for the given date; key is the
 *                                                instruction's name, value the instruction's value,
 *                                                e.g. [{ select, -1, weight: 5 }]
 * @param {number} options.investedRatio          Ratio of the total amount of money available
 *                                                that should be invested
 * @param {number} options.maxRatioPerInstrument  Maximum ratio of the total amount of money
 *                                                available that should be invested in one single
 *                                                instrument
 * @param {function} options.getPointValue        Function that takes instrument name as an argument
 *                                                and returns point value
 * @param {object[]} margins                      Margins for current date with one entry per
 *                                                instrument, each with instrument, date, margin
 *                                                (relative number)
 * @param {object} previous                       Trading results from the previous date; see return
 *                                                comment
 * @return {object}                               Object with the trading results for the current
 *                                                date
 */
export default (
    date,
    openPrices,
    closePrices,
    instructionFieldPrices,
    instructionSet,
    {
        investedRatio,
        maxRatioPerInstrument,
        getPointValue,
    },
    relativeMargins,
    previous,
) => {

    // Set with all instrument names that are relevant for the current date (either have an
    // instruction or a position or a price)
    const allInstruments = new Set(
        openPrices.keys(),
        instructionSet.map(({ instrument }) => instrument),
        previous.positions.map(({ instrument }) => instrument),
    );
    // Map.<string, number> with point value for every relevant instrument on current datef
    const pointValues = new Map(Array.from(allInstruments)
        .map(instrument => [instrument, getPointValue(instrument, date)]));

    // Execute orders (in the morning, when only open prices are known)
    const { positions, cost } = executeOrders(
        // Use orders from previous close
        previous.orders,
        openPrices,
        // Pass in previous positions
        previous.positions,
        date,
        relativeMargins,
        pointValues,
    );

    const cash = previous.cash - cost;

    // Get values of all positions (in the evening when close prices are known); value is needed
    // to calculate orders for next day.
    const positionValues = getPositionsValues(
        positions,
        previous.positionValues,
        closePrices,
        pointValues,
    );

    const allPositionsValue = Array
        .from(positionValues.values())
        .reduce((sum, value) => sum + value, 0);

    // Ignore instructions that are have a current position and are not rebalanced
    const validInstructions = filterRebalances(instructionSet, positions);

    // Get value sum of all positions that may be traded on the current bar
    const valueOfTradingPositions = getTradableAmount(
        validInstructions,
        positionValues,
    );

    // Get amount that is available for trading
    const { maxAmount, maxAmountPerInstrument } = getAmounts(
        cash,
        valueOfTradingPositions,
        allPositionsValue,
        investedRatio,
        maxRatioPerInstrument,
    );

    // Create expected positions for next bar. Sizes are absolute (-28 means that we should be
    // 28 total short, not add another short position of 28).
    // Nice thing is: As we use all the amount available for trading, we just have to redistribute
    // the positions amoung the amount available and do not have to care about positions getting
    // larger or smaller (and thereby freeing money).
    const expectedPositions = createExpectedPositions(
        validInstructions,
        instructionFieldPrices,
        maxAmount,
        maxAmountPerInstrument,
        pointValues,
    );


    // Map.<string, number> where key is the instrument name and value the current position size
    const currentPositions = new Map(positions.map(position =>
        [position.instrument, position.size]));

    // Map.<string, number> where key is the instrument name and value is the order size. Ignore
    // all orders that have existed previously but were not executed.
    const orders = createOrders(expectedPositions, currentPositions);

    return {
        date,
        positions,
        orders,
        positionValues,
        cash,
    };

};
