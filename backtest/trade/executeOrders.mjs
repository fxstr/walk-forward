import createPosition from './createPosition.mjs';

/**
 * Executes orders for a given date.
 * @param  {Map} orders                   Orders to execute, each order with
 *                                        - key: instrument's name
 *                                        - value: order size
 * @param  {Map} prices                   Data for a date:
 *                                        - key: instrument's name
 *                                        - value: instrument's open price
 * @param {Map.<string, number>} relativeMargins   Relative margins for all current instruments.
 *                                        Defaults to empty map which is replaced with 1.
 * @param {Map.<string, number>} pointValues    Worth of one point in the base currency
 * @return {Object}                       Object with
 *                                        - positions (new positions as array of objects, see
 *                                          createPosition()). Closed positions will have size 0
 *                                          for one bar, afterwards they will be removed. This is
 *                                          needed to create performance indicators at the end
 *                                          (e.g. was it a winning or losing trade?)
 *                                        - cost: total cost of all trades that were made
 */
export default function executeOrders(
    orders,
    openPrices,
    // Use defaults to simplify testing
    relativeMargins = new Map(),
    pointValues = new Map(),
) {

    // Get all orders that have open data for today; if they don't, they cannot be executed and
    // will be returned as unfulfilled
    const ordersWithData = new Map(Array
        .from(orders.entries())
        .filter(([instrument]) => openPrices.has(instrument)));

    // openPrices adjusted for pointValue; corresponds to open price of one contract in base
    // currency
    // const openPricesAdjustedForPointValue = new Map(Array.from(openPrices.entries())
    //    .map(([instrument, price]) => [instrument, price * (pointValues.get(instrument) || 1)]));

    // Create a position for every order that has an open value for the current date
    const newPositions = Array
        .from(ordersWithData.entries())
        .map(([instrument, size]) => createPosition(
            instrument,
            size,
            openPrices.get(instrument),
            (relativeMargins.get(instrument) || 1) * openPrices.get(instrument),
            pointValues.get(instrument),
        ));

    return newPositions;

}
