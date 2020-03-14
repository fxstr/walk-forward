import test from 'ava';
import calculatePositionStatistics from './calculatePositionStatistics.mjs';

const createEntry = (bars, openValue, closeValue) => ({
    bars,
    openValue,
    closeValue,
});

const setupData = () => [
    // Winning (at least 2 for avg/max winning)
    createEntry(4, 2, 7),
    createEntry(2, 4, 5),
    // Losing
    createEntry(2, 5, 4),
    createEntry(2, 7, 3),
    // Neutral
    createEntry(4, 4, 4),
];

test('returns expected position statistics', (t) => {
    const data = setupData();
    const result = calculatePositionStatistics(data);
    t.deepEqual(result, {
        numberOfPositions: 5,
        numberOfWinningPositions: 2,
        numberOfLosingPositions: 2,
        percentProfitable: 2 / 5,
        averageBarsHeld: 14 / 5,
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
