import calculatePositionValue from './calculatePositionValue.mjs';

/**
 * Returns the *total* value of multiple positions
 * @param  {Object[]}           Array of positions
 * @param {Map} currentValues   Current prices, where
 *                              - key is the instrument name
 *                              - value is the price
 * @return {Number}             Total value of all positions
 */
export default (positions, currentPrices) => positions.reduce((prev, position) => (
    prev + calculatePositionValue(
        position.size,
        position.openPrice,
        currentPrices.get(position.instrument),
    )
), 0);

