import test from 'ava';
import calculatePositionStatistics from './calculatePositionStatistics.mjs';

const createEntry = (openDate, closeDate, openValue, closeValue) => ({
    openDate,
    closeDate,
    openValue,
    closeValue,
});

const setupData = () => [
    // Winning (at least 2 for avg/max winning)
    createEntry(1, 5, 2, 7),
    createEntry(1, 3, 4, 5),
    // Losing
    createEntry(2, 4, 5, 4),
    createEntry(3, 5, 7, 3),
    // Neutral
    createEntry(5, 9, 4, 4),
];

test('returns expected result', (t) => {
    const data = setupData();
    const result = calculatePositionStatistics(data);
    t.deepEqual(result, {
        numberOfPositions: 5,
        numberOfWinningPositions: 2,
        numberOfLosingPositions: 2,
        percentProfitable: 2 / 5,
        // (4 + 2 + 2 + 2 + 4) / 5 converted to days
        averageHoldingTimeInDays: 14 / 5 / (1000 * 60 * 60 * 24),
        grossProfit: 6,
        grossLoss: 5,
        profitFactor: 6 / 5,
        averageTradeNetProfit: 1 / 5,
        averageWinningTradeProfit: 6 / 2,
        averageLosingTradeLoss: 5 / 2,
        maxWinningTrade: 5,
        maxLosingTrade: 4,
    });
});
