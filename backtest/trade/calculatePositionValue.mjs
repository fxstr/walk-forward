import logger from '../logger/logger.mjs';

const { debug } = logger('WalkForward:getPositionsValues');

/**
 * Calculates the current value of a position; is easy for long positions (size * price) and a
 * bit more complicated for short ones.
 * @param {number} positionSize
 * @param {number} initialPrice       Price of the instrument when the position was opened
 * @param {number} currentPrice       Current price of the instrument
 * @param {number} initialMarginPrice Absolute margin price of the instrument when the position
 *                                    was opened
 * @param {number} initialPointValue  Value of one point when the position was opened (exchange
 *                                    rate or contract size or both)
 * @param {number} currentpointValue  Current value of one point (exchange rate or contract
 *                                    size or both)
 * @return {number}                   Position's current value
 */
export default (
    positionSize,
    initialPrice,
    currentPrice,
    initialMarginPrice = initialPrice,
    initialPointValue = 1,
    currentPointValue = 1,
) => {
    const originalPriceForCurrentSize = Math.abs(positionSize) * initialMarginPrice *
        initialPointValue;
    const value = originalPriceForCurrentSize +
        (((currentPrice * currentPointValue) - (initialPrice * initialPointValue)) *
            positionSize);
    return value;
};
