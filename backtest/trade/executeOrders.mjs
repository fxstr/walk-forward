import createPosition from './createPosition.mjs';
import groupBy from '../dataHelpers/groupBy.mjs';
import mergePositions from './mergePositions.mjs';
import calculatePositionsValues from './calculatePositionsValues.mjs';

/**
 * Executes orders for a given date.
 * @param  {Map} orders                   Orders to execute, each order with
 *                                        - key: instrument's name
 *                                        - value: order size
 * @param  {Map} prices                   Data for a date:
 *                                        - key: instrument's name
 *                                        - value: instrument's open
 * @param  {object[]} previousPositions   Previous positions, every object with
 *                                        - instrument (name)
 *                                        - size
 *                                        - openDate
 *                                        - openPrice
 * @param {Map} relativeMargins           Relative margins for all current instruments. Defaults to
 *                                        empty map which is replaced with 1.
 * @param {} [varname] [description]
 * @return {Object}                       Object with
 *                                        - positions (new positions as array of objects, each with
 *                                          size, instrument, openDate, openPrice)
 */
export default function executeOrders(
    orders,
    prices,
    previousPositions,
    date,
    relativeMargins = new Map(),
) {

    // Get all orders that have open data for today; if they don't, they cannot be executed and
    // will be returned as unfulfilled
    const ordersWithData = new Map(Array
        .from(orders.entries())
        .filter(([instrument]) => prices.has(instrument)));

    // Create a position for every order that has an open value for the current date
    const newPositions = Array
        .from(ordersWithData.entries())
        .map(([instrument, size]) => createPosition(
            instrument,
            size,
            prices.get(instrument),
            date,
            (relativeMargins.get(instrument) || 1) * prices.get(instrument),
        ));

    // Concat old and new positions, group by instrument
    const newAndOldPositionsGrouped = groupBy(
        // Make sure previous positions come first, as new positions should be merged into previous
        // ones (and not the opposite)
        [...previousPositions, ...newPositions],
        ({ instrument }) => instrument,
    );

    // Merge multiple positions of the same instrument into one single position
    const positions = newAndOldPositionsGrouped
        // Merge old and new positions of the same instrument
        .map(([, positionData]) => mergePositions(...positionData))
        // Remove all empty positions
        .filter(position => position.size !== 0);

    // Calculate cost used/feed by executing all orders. Equals the *current* value of all current
    // positions minus the *current* value of all previous positions. We can neglect all instruments
    // without data as those are not traded.
    const hasOpenData = position => prices.has(position.instrument);
    const newPositionsWithData = positions.filter(hasOpenData);
    const previousPositionsWithData = previousPositions.filter(hasOpenData);
    const cost = calculatePositionsValues(newPositionsWithData, prices) -
        calculatePositionsValues(previousPositionsWithData, prices);

    return {
        positions,
        cost,
    };

}
