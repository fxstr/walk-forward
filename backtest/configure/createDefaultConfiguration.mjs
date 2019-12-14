/**
 * Creates default configuration for backtest
 */
export default () => ({
    // How much (ratio) of our total capital should we invest? 1 equals 100%.
    investedRatio: 1,
    // How much of our capital should we assign to one instrument at max? 1 equals 100%.
    maxRatioPerInstrument: 1,
    // Returns the instrument's relative margin, e.g 0.4 if margin is 40%
    getMargin: () => 1,
    // Returns the instrument's point value, i.e. the movement (in the currency) for the change of
    // one point, e.g. 400 for live cattle (40'000 pound for 1 cent)
    getPointValue: () => 1,
    // Calculate position size depending on this field on close of a bar
    instructionField: 'close',
});
