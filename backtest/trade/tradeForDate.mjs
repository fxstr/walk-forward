import executeOrders from './executeOrders.mjs';
import createExpectedPositions from './createExpectedPositions.mjs';
import getTradableAmount from './getTradableAmount.mjs';
import getAmounts from './getAmounts.mjs';
import createOrders from './createOrders.mjs';
import filterRebalances from './filterRebalances.mjs';
import logger from '../logger/logger.mjs';
import mergePositions from './mergePositions.mjs';
import mergeMultipleInstrumentPositions from './mergeMultipleInstrumentPositions.mjs';
import updatePositions from './updatePositions.mjs';
import updatePosition from './updatePosition.mjs';
import calculateCost from './calculateCost.mjs';
import logPositions from './logPositions.mjs';
import logCloseData from './logCloseData.mjs';
import logOpenData from './logOpenData.mjs';
import logExpectedPositions from './logExpectedPositions.mjs';

const { debug } = logger('WalkForward:tradeForDate');

/**
 * Executes trade for one certain date
 * @param {number} date                           Date the trades are executed for
 * @param {Map.<string, number>} openPrices       Open prices; key is the instrument's name, value
 *                                                the open price at date
 * @param {Map.<string, number>} closePrices      Closing prices; key is the instrument's name,
 *                                                value the clsoing price at date
 * @param {Map.<string, number>} instructionFieldPrices      Prices used to calculate order size;
 *                                                usually close price, but might e.g be ATR or
 *                                                stdDev for futures
 * @param {Object.<string, number>[]} instructionSet  Instructions for the given date; key is the
 *                                                instruction's name, value the instruction's value,
 *                                                e.g. [{ select, -1, weight: 5 }]
 * @param {Map.<string, number>} pointValues      Point values at current time; key is instrument
 *                                                name, value is point value
 * @param {number} options.investedRatio          Ratio of the total amount of money available
 *                                                that should be invested
 * @param {number} options.maxRatioPerInstrument  Maximum ratio of the total amount of money
 *                                                available that should be invested in one single
 *                                                instrument
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
    pointValues,
    {
        investedRatio,
        maxRatioPerInstrument,
    },
    relativeMargins,
    previous,
) => {


    debug('%t >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', date);



    // OPEN: Update value of existing positions
    // Update prices on existing positions before we merge previous and new positions together
    // @type {object[]}
    const positionsOnOpen = updatePositions(
        // Only use positions of type close
        previous.positions.filter(position => position.type === 'close'),
        updatePosition,
        false,
        openPrices,
        pointValues,
    );



    // AFTER OPEN: Trade to fulfill previous.orders; use open prices to do so
    // Execute orders (in the morning, when open prices are known). This creates new positions –
    // they must still be merged with the current ones
    // @type {object[]}
    const newPositions = executeOrders(
        // Use orders from previous close
        previous.orders,
        openPrices,
        relativeMargins,
        pointValues,
    );


    // Instruments that are relevant on current bar; neede for logs
    const relevantInstruments = new Set([
        ...positionsOnOpen.map(({ instrument }) => instrument),
        ...newPositions.map(({ instrument }) => instrument),
    ]);

    if (newPositions.length) debug('%t: New positions are %O', date, newPositions);
    logOpenData(debug, { relevantInstruments, relativeMargins, openPrices });



    // Merge previous with new positions
    // @type {object[]}
    const positions = mergeMultipleInstrumentPositions(
        [...positionsOnOpen, ...newPositions],
        mergePositions,
    );



    // Find out how much money was used to create the new positions.
    // type {number}
    const cost = calculateCost(positions, positionsOnOpen);
    const cash = previous.cash - cost;
    debug('%t: Previous cash was %m, cost is %m, new cash is %m', date, previous.cash, cost, cash);



    // CLOSE: Update prices for all positions
    const positionsOnClose = updatePositions(
        positions,
        updatePosition,
        true,
        closePrices,
        pointValues,
    );
    logCloseData(debug, { positionsOnClose, pointValues, closePrices });

    logPositions(debug, {
        opened: positionsOnOpen,
        merged: positions,
        closed: positionsOnClose,
    });


    // AFTER CLOSE: Generate orders for next bar
    const allPositionsValue = positionsOnClose.reduce((sum, { value }) => sum + value, 0);

    // Ignore instructions that are have a current position and are not rebalanced
    const tradedInstructions = filterRebalances(instructionSet, positionsOnClose);
    if (tradedInstructions.length) {
        debug('%t: Instructions traded on current bar are %O', date, tradedInstructions);
    }

    // Get value sum of all positions that may be traded (rebalanced, created or closed) on the
    // current bar
    const valueOfCurrentlyTradingPositions = getTradableAmount(
        tradedInstructions,
        positionsOnClose,
    );

    // Get amount that is available for trading
    const { maxAmount, maxAmountPerInstrument } = getAmounts({
        cash,
        trading: valueOfCurrentlyTradingPositions,
        bound: allPositionsValue - valueOfCurrentlyTradingPositions,
        investedRatio,
        ratioPerInstrument: maxRatioPerInstrument,
    });
    debug('%t: Max amount is %d, per instrument %d', date, maxAmount, maxAmountPerInstrument);

    // Create expected positions for next bar. Sizes are absolute (-28 means that we should be
    // 28 total short, not add another short position of 28).
    // Nice thing is: As we use all the amount available for trading, we just have to redistribute
    // the positions amoung the amount available and do not have to care about positions getting
    // larger or smaller (and thereby freeing money).
    const expectedPositions = createExpectedPositions(
        tradedInstructions,
        instructionFieldPrices,
        maxAmount,
        maxAmountPerInstrument,
        pointValues,
    );
    logExpectedPositions(debug, { expectedPositions, instructionFieldPrices, pointValues });


    // Map.<string, number> where key is the instrument name and value the current position size
    const currentPositions = new Map(positionsOnClose.map(position =>
        [position.instrument, position.size]));


    // Map.<string, number> where key is the instrument name and value is the order size. Ignore
    // all orders that have existed previously but were not executed.
    const orders = createOrders(expectedPositions, currentPositions);
    if (orders.size) debug('%t: Orders are %O', date, orders);


    debug('%t <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n\n\n', date);


    return {
        date,
        positions: [...positionsOnOpen, ...positionsOnClose],
        orders,
        cash,
    };

};
