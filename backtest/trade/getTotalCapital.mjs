/**
 * Returns total amount of capital for a result series; total amount consists of value of all
 * positions and cash on a given date.
 * @param {object[]} result       Result of trades as created by trade.mjs
 * @returns {array[]}             Array with one entry per date, each with [date, amount]
 */
export default result => (

    result.map(bar => [
        bar.date,
        bar.cash + Array.from(bar.positionValues.values())
            .reduce((sum, value) => sum + value, 0),
    ])

);
