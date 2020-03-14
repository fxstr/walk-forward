/**
 * Money needed to buy instruments equals (the price currently paid for the current position) minus
 * (the price currently paid for the previous positions). It is crucial that for both positions
 * (previous and current), the same prices are used to calculate their value.
 *
 * @param {object[]} currentPositions     Array of positions as created by createPosition
 * @param {object[]} previousPositions    Array of positions as created by createPosition
 * @return {number}                       The amount of money that was necessary to buy the
 *                                        currentPositions (in relation to previousPositions). If
 *                                        number is negative, money was freed.
 */
export default (currentPositions, previousPositions) => {
    const getValueSum = (sum, { value }) => sum + value;
    return currentPositions.reduce(getValueSum, 0) - previousPositions.reduce(getValueSum, 0);
};
