import test from 'ava';
import tradeForDate from './tradeForDate.mjs';

test('trades as expected', (t) => {

    const result = tradeForDate(
        // Date
        123,
        // Open prices
        new Map([['aapl', 12.5], ['amzn', 11.2]]),
        // Close prices
        new Map([['aapl', 15.8], ['amzn', 13.7]]),
        // Instructions to create new orders from
        [{
            instrument: 'aapl',
            weight: 2,
            selected: -1,
            trade: true,
        }, {
            instrument: 'amzn',
            weight: 3,
            selected: 1,
            trade: true,
        }],
        // Config
        {
            investedRatio: 0.9,
            maxRatioPerInstrument: 0.5,
        },
        // Previous
        {
            // Previous positions
            positions: [{
                instrument: 'aapl',
                size: 4,
                openDate: 120,
                openPrice: 12,
            }, {
                instrument: 'amzn',
                size: 10,
                openDate: 119,
                openPrice: 9.2,
            }],
            // Previous positionValues (not relevant here)
            positionValues: new Map(),
            // Previous cash
            cash: 100,
            // Orders from previous bar
            orders: new Map([['aapl', 4], ['amzn', -12]]),
        },
    );

    t.deepEqual(result, {
        date: 123,
        positions: [{
            instrument: 'aapl',
            size: 8,
            openDate: 120,
            // Were 4@12, plus new 4@12.5 open = 12.25 (average)
            openPrice: 12.25,
        }, {
            instrument: 'amzn',
            size: -2,
            openDate: 123,
            openPrice: 11.2,
        }],
        // Values depend on closing prices
        // - aapl 8@15.8 = 126.4
        // - amzn -2@13.7, opened at 11.2, loss of 2.5/instr = 17.4
        positionValues: new Map([['aapl', 126.4], ['amzn', 17.4]]),
        // - Previous 100
        // - Shorted 2 amzn@11.2 (-22.4)
        // - Bought 4 aapl@12.5 (-50)
        // - Sold 10 amzn@11.2 (+112)
        // → 100 - 22.4 - 50 + 112 = 139.6
        cash: 139.6,
        // Available 283.4 (t)
        // - cash 139.6
        // - aapl 126.4 (see positionValues)
        // - amzn 17.4 (see positionValues)
        // Use max t*0.9 (255.06) total or t*0.5 (141.7) per order
        // aapl@15.8 gets 40% (t*0.9*0.4 = 102.02), amzn@13.9 50% (t*0.5, 141.7)
        // aapl is 6.45 (-6), amzn is 10.34 (10)
        // Existing positions are aapl 8, amzn -2; those need to be deducted from absolute sizes
        orders: new Map([['aapl', -14], ['amzn', 12]]),
    });

});
