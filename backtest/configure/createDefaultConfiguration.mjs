/**
 * Creates default configuration for backtest
 */
export default () => ({
    // How much (ratio) of our total capital should we invest? 1 equals 100%.
    investedRatio: 1,
    // How much of our capital should we assign to one instrument at max? 1 equals 100%.
    maxRatioPerInstrument: 1,
});
