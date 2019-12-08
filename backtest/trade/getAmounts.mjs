/**
 * Calculates the amounts that are available for trading
 */
export default (
    cash,
    valueOfTradingPositions,
    allPositionsValue,
    investedRatio = 1,
    maxRatioPerInstrument = 1,
) => {
    // Amount that is invested and cannot be touched (because instruments are not up for trade)
    const untouchablyInvested = allPositionsValue - valueOfTradingPositions;
    const maxAmount = Math.min(
        // For current investment, we have to deduct the already invested amount from the max
        // amount available
        ((cash + allPositionsValue) * investedRatio) - untouchablyInvested,
        // Currently available amount for trading
        cash + valueOfTradingPositions,
    );
    const maxAmountPerInstrument = (cash + allPositionsValue) * maxRatioPerInstrument;
    return { maxAmount, maxAmountPerInstrument };
};
