/**
 * Creates default configuration for backtest
 */
export default () => ({
    // How much (ratio) of our total capital should we invest? 1 equals 100%.
    investedRatio: 1,
    // How much of our capital should we assign to one instrument at max? 1 equals 100%.
    maxRatioPerInstrument: 1,
    // Returns the instrument's relative margin, e.g 0.4 if margin is 40%. Use relative values
    // (instead of absolute ones) to simplify most cases (e.g. stocks where margin might just
    // be 0.5). Takes arguments to create instrument/date specific margins.
    getMargin: () => 1,
    // Returns the instrument's point value, i.e. the movement (in the currency) for the change of
    // one point, e.g. 400 for live cattle (40'000 pound for 1 cent). If you want to use foreign
    // currencies, adjust pointValue. If 1 GBP equals 1.5 USD and contract size is 100, use 62.5
    // for the given date.
    getPointValue: () => 1,
    // Returns exchange rate for a given instrument at a given point in time. If 1 gbp = 1.6 usd
    // and usd is your base currency, use 0.625
    // getOnePointInBaseCurrency: () => 1,
    // Calculate position size depending on this field on close of a bar
    instructionField: 'close',
});
