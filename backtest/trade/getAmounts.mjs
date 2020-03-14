import logger from '../logger/logger.mjs';

const { debug } = logger('WalkForward:getAmounts');

/**
 * Calculates the amounts that are available for trading
 * @param {number} cash                   Current amount held in cash
 * @param {number} valueOfCurrentlyTradingPositions      Value of all positions that are being
 *                                        traded on the current date (i.e. their sizes may be
 *                                        changed)
 * @param {number} allPositionsValue      Value of all current positions added together
 * @param {number} investedRatio          Ratio that we want to be invested; 0.8 for 80%
 * @param {number} maxRatioPerInstrument  Max % of available capital that should flow into one
 *                                        single instrument; 0.2 for 20%
 */
export default (
    cash,
    valueOfCurrentlyTradingPositions,
    allPositionsValue,
    investedRatio = 1,
    maxRatioPerInstrument = 1,
) => {
    // Amount that is invested and cannot be touched (because instruments are not up for trade)
    const untouchablyInvested = allPositionsValue - valueOfCurrentlyTradingPositions;
    const maxAmountToInvest = (cash + allPositionsValue) * investedRatio;
    const effectivelyAvailableForTrading = cash + valueOfCurrentlyTradingPositions;
    const maxAmount = Math.min(
        // Use max amount to invest and deduct already invested amount that is not up for
        // rebalancing
        maxAmountToInvest - untouchablyInvested,
        // Currently available amount for trading, if it is lower than the (theoretical) maximal
        // amount to invest
        effectivelyAvailableForTrading,
    );
    // The amount available for a single instrument depends not on the money available for trading
    // on current bar, but on all the money we have (including current investments not up for
    // rebalancing)
    const maxAmountPerInstrument = (cash + allPositionsValue) * maxRatioPerInstrument;
    debug('Max amount to invest is %d', maxAmountToInvest);
    debug('Already invested (without rebalance) is %d', untouchablyInvested);
    debug('Effectively available for trading is %d', effectivelyAvailableForTrading);
    debug(
        'Invested ratio is %d, max ratio per instrument %d',
        investedRatio,
        maxRatioPerInstrument,
    );
    return { maxAmount, maxAmountPerInstrument };
};
