let orders;

const strategy = createStrategy()
    .addIndicator(params => [
        'slowSma',
        tulip('SMA', { input: 'close' }, { duration: params.fastSma })],
    )
    .addIndicator(params => [
        'fastSma',
        tulip('SMA', { input: 'close' }, { duration: params.slowSma })],
    )
    // Only order on 1st of month (if no data is available for 1st of month, previous data is used)
    .decelerate('month')
    // Sort instruments (for every tick) by the difference of fastSma - slowSma
    .sort((latestDataA, latestDataB) => (
        (latestDataA.fastSma - latestDataA.slowSma) - (latestDataB.fastSma - latestDataB.slowSma)
    )
    // Select instruments with fastSma > slowSma
    .select(latestData => latestData.fastSma > latestData.slowSma)
    // Select only 10 top instruments with largest difference between fastSma and slowSma
    // (by unselecting instruments with index < 10)
    .unselect((latestData, allLatestData, sortIndex) => sortIndex < 10)
    // Weight by ATR
    .weight(latestData => latestData.atr)
    // No instrument takes up more than 10%
    .limitWeight('10%')
    // Use 80% of money available to trade
    .assign(moneyCurve => moneyCurve.get('total') * 0.8, )


strategy
    .useData(readFromCsv('./instruments/*.csv'))
    .run({ fastSma: 10, slowSma: 20 });
    // .optimize('fastSma', { from: 0, to: 10, steps: 3, type: linear })
    // .walkForward(…)





- properties on instrument, e.g. margin
- combine strategies?
- create orders, and trade orders?
- optimizations & parameters?

// First
new Map([
    ['aapl', {
        data: [
            {
                date: 1912341231
                data: new Map([
                    ['open', 5.12],
                    ['close', 5.31],
                ]),
                selected: false,
                sortOrder: 1,
                weight: 3.71,
            }
        ],
    }]
])

