import logger from '../logger/logger.mjs';

const { debug } = logger('WalkForward:getAmounts');

/**
 * Calculates the amounts that are available for trading
 * @param {number} cash                   Current amount held in cash
 * @param {number} traded                 Value of all positions that are being
 *                                        traded on the current date (i.e. their sizes may be
 *                                        changed)
 * @param {number} bound                  Value of all current positions that may *not* be traded
 *                                        on current bar (that don't have orders or data)
 * @param {number} investedRatio          Ratio that we want to be invested; 0.8 for 80%
 * @param {number} ratioPerInstrument     Max % of available capital that should flow into one
 *                                        single instrument; 0.2 for 20%
 */
export default ({
    cash,
    trading,
    bound,
    investedRatio = 1,
    ratioPerInstrument = 1,
}) => {

    if (typeof cash !== 'number' || typeof trading !== 'number' || typeof bound !== 'number') {
        throw new Error(`getAmounts: cash (${cash}), trading (${trading}) and bound (${trading}) must all be numbers; at least one is not.`);
    }
    if (typeof investedRatio !== 'number' || typeof ratioPerInstrument !== 'number') {
        throw new Error(`getAmounts: investedRatio (${investedRatio}) and ratioPerInstrument (${ratioPerInstrument}) must all be numbers; at least one is not.`);
    }

    // If any value is negative, it will be subtracted
    const total = cash + trading + bound;
    const maxAmountToInvest = total * investedRatio;
    // If trading is negative, it will be deducted from cash
    const effectivelyAvailableForTrading = cash + trading;

    const maxAmount = Math.max(
        // Max amount may *never* be below 0. That will turn everything upside down (as we're
        // dividing a negative number, which will invert position sizes etc.)
        // Negative amounts happen when cash is smaller than the positions values (because they
        // grew nicely).
        0,
        // Take smaller sum of either money available or max money that we are allowed to invest.
        Math.min(
            // Use max amount to invest and deduct already invested amount that is not up for
            // rebalancing (as it counts against the max ratio that we want to invest).
            // If bound value is negative, it has already been deducted from total; no need to
            // add it here again (double subtraction will result in addition).
            maxAmountToInvest - Math.max(0, bound),
            // Currently available amount for trading, if it is lower than the (theoretical)
            // maximum amount to invest
            effectivelyAvailableForTrading,
        ),
    );

    // The amount available for a single instrument depends not on the money available for trading
    // on current bar, but on all the money we have (including current investments not up for
    // rebalancing). This works because when calculating position sizes, we take the *minimum* of
    // maxAmount (multiplied with the position's weight) and maxAmountPerInstrument. Make sure,
    // however, that returned result is never larger than maxAmount (that would just not make
    // sense).
    const maxAmountPerInstrument = Math.max(
        0,
        Math.min(total * ratioPerInstrument, maxAmount),
    );

    debug('Cash is %m, traded %m, bound %m; total is %m', cash, trading, bound, total);
    debug('Max amount to invest is %m', maxAmountToInvest);
    debug('Already invested (without rebalance) is %m', bound);
    debug('Effectively available for trading is %m', effectivelyAvailableForTrading);
    debug(
        'Invested ratio is %m, max ratio per instrument %m',
        investedRatio,
        ratioPerInstrument,
    );

    return { maxAmount, maxAmountPerInstrument };

};
