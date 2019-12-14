/**
 * Creates a single position from an order
 * @param  {Object} order            Order to create position for
 * @param {String} order.instrument
 * @param {Number} order.size
 * @param  {Number} currentPrice
 * @param  {Number} currentDate
 * @return {Object}                  Position created
 */
export default (instrument, size, currentPrice, currentDate, marginPrice) => ({
    instrument,
    size,
    // Open price is used to calculate gain/loss for position
    openPrice: currentPrice,
    openDate: currentDate,
    // Margin price is added to gain/loss to get position value
    marginPrice,
});

