import logger from '../logger/logger.mjs';

const { debug } = logger('WalkForward:getPositionsValues');

/**
 * Calculates the current value of a position; is easy for long positions (size * price) and a
 * bit more complicated for short ones.
 * @param  {Number} positionSize
 * @param  {Number} openPrice     Price that was paid when the position was opened
 * @param  {Number} currentPrice
 * @return {Number}               Position's current value
 */
export default (positionSize, openPrice, marginPrice, currentPrice) => {
    const value = (Math.abs(positionSize) * marginPrice) +
        ((currentPrice - openPrice) * positionSize);
    debug('Value for %d is %d', currentPrice, value);
    return value;
};
