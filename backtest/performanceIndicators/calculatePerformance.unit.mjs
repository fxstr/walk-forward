import test from 'ava';
import createTestResultData from '../testData/createTestResultData.mjs';
import calculatePerformance from './calculatePerformance.mjs';


test('exports performance', (t) => {

    const data = createTestResultData();
    const result = calculatePerformance(data).performance;

    // For values, see getClosedPositions.unit.mjs (where all closed positions are listed)
    const expectation = [
        ['numberOfPositions', 3],
        ['numberOfWinningPositions', 1],
        ['numberOfLosingPositions', 1],
        ['percentProfitable', 1 / 3],
        ['averageBarsHeld', 4 / 3],
        ['grossProfit', 28],
        ['grossLoss', 5],
        ['profitFactor', 28 / 5],
        ['averageTradeNetProfit', (28 - 5) / 3],
        ['averageWinningTradeProfit', 28],
        ['averageLosingTradeLoss', 5],
        ['maxWinningTrade', 28],
        ['maxLosingTrade', 5],
        ['annualRelativeGrowth', 0.238551036159645],
        ['annualRelativeGrowthVariance', 0.002736915797993955],
        ['maxRelativeDrawdown', 0.07353781672699577],
    ];
    t.deepEqual(result, new Map(expectation));

});
