/**
 * Creates a single position from an order
 * @param  {Object} order            Order to create position for
 * @param {String} order.instrument
 * @param {Number} order.size
 * @param  {Number} currentPrice
 * @param  {Number} currentDate
 * @return {Object}                  Position created
 */
export default (instrument, size, currentPrice, currentDate) => ({
    instrument,
    size,
    openPrice: currentPrice,
    openDate: currentDate,
    // Store value on position; this allows us to e.g. get the value of all previous positions –
    // even when there is no data available for the current date – and thereby calculate the cost
    // of a transaction.
    // value: currentPrice * size,
});

