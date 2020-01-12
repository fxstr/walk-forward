/**
 * Calculates max drawdown for a given capital curve
 * @param  {array[]} capital    Capital as [[date, capital], [date, capital]]
 * @return {number}
 */
export default capital => (
    capital.reduce((previous, [, value]) => ({
        highestHigh: Math.max(previous.highestHigh, value),
        maxDrawdown: Math.max(previous.maxDrawdown, 1 - (value / previous.highestHigh)),
    }), {
        maxDrawdown: 0,
        highestHigh: 0,
    }).maxDrawdown
);

