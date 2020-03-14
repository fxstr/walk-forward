/**
 * Calculates and returns position related performance indicators
 * @param  {object[]} closedPositions    Objects with instrument, openDate, closeDate, openValue,
 *                                       closeValue
 * @return {object}                      Object with properties:
 *                                       - numberOfPositions
 *                                       - numberOfWinningPositions
 *                                       - numberOfLosingPositions
 *                                       - percentProfitable
 *                                       - averageHoldingTime … (see below)

 */
export default (closedPositions) => {

    const numberOfPositions = closedPositions.length;

    const winningPositions = closedPositions
        .filter(position => position.closeValue > position.openValue);
    const losingPositions = closedPositions
        .filter(position => position.closeValue < position.openValue);

    const numberOfWinningPositions = winningPositions.length;
    // Careful: there might also be indifferent positions (not losing nor winning)
    const numberOfLosingPositions = losingPositions.length;
    const percentProfitable = numberOfWinningPositions / numberOfPositions;

    const averageBarsHeld = closedPositions.reduce((sum, { bars }) => sum + bars, 0) /
        closedPositions.length;

    const grossProfit = winningPositions
        .reduce((sum, position) => sum + (position.closeValue - position.openValue), 0);
    const grossLoss = losingPositions
        .reduce((sum, position) => sum + (position.openValue - position.closeValue), 0);
    const profitFactor = grossProfit / grossLoss;

    const averageTradeNetProfit = (grossProfit - grossLoss) / numberOfPositions;
    const averageWinningTradeProfit = grossProfit / numberOfWinningPositions;
    const averageLosingTradeLoss = grossLoss / numberOfLosingPositions;

    const maxWinningTrade = winningPositions
        .reduce((max, position) => Math.max(max, position.closeValue - position.openValue), 0);
    const maxLosingTrade = losingPositions
        .reduce((max, position) => Math.max(max, position.openValue - position.closeValue), 0);

    return {
        numberOfPositions,
        numberOfWinningPositions,
        numberOfLosingPositions,
        percentProfitable,
        averageBarsHeld,
        grossProfit,
        grossLoss,
        profitFactor,
        averageTradeNetProfit,
        averageWinningTradeProfit,
        averageLosingTradeLoss,
        maxWinningTrade,
        maxLosingTrade,
    };

};

// nr of positions (trades w/o rebalances/adjustments)
// nr & % winning
// nr & % losing
// percent profitable trades (% winning / total)

// avg losing amount?
// avg winning amount?

// avg holding time
// TODO: avg exposure
// TODO: % time in market

// gross profit
// gross loss
// profit factor (gross profit / gross loss)

// avg trade net profit
// avg winning trade
// avg losing trade
// max winning trade
// max losing trade

