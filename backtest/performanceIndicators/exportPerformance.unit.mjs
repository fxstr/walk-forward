import test from 'ava';
import createTestResultData from '../testData/createTestResultData.mjs';
import exportPerformance from './exportPerformance.mjs';



test('exports performance', (t) => {
    const data = createTestResultData();
    const result = exportPerformance()(data);

    const expectation = [
        ['numberOfPositions', 2],
        ['numberOfWinningPositions', 1],
        ['numberOfLosingPositions', 1],
        ['percentProfitable', 0.5],
        ['averageHoldingTimeInDays', 5],
        ['grossProfit', 4],
        ['grossLoss', 18],
        ['profitFactor', 4 / 18],
        ['averageTradeNetProfit', -7],
        ['averageWinningTradeProfit', 4],
        ['averageLosingTradeLoss', 18],
        ['maxWinningTrade', 4],
        ['maxLosingTrade', 18],
        ['annualRelativeGrowth', -1.100369987407761],
        ['annualRelativeGrowthVariance', 0.7485492735717093],
        ['maxRelativeDrawdown', 0.028330019880715707],
    ].map(([name, value]) => `${name},${value}`).join('\n');

    t.deepEqual(result, expectation);
});
