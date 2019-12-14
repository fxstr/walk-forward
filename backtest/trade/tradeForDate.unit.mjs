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
        // instructionField prices
        new Map([['aapl', 15.8], ['amzn', 13.7]]),
        // Instructions to create new orders from
        [{
            instrument: 'aapl',
            weight: 2,
            selected: -1,
            rebalance: true,
        }, {
            instrument: 'amzn',
            weight: 3,
            selected: 1,
            rebalance: true,
        }],
        // Config
        {
            investedRatio: 0.9,
            maxRatioPerInstrument: 0.5,
            getPointValue: () => 1,
        },
        // Margins (default to 1)
        new Map(),
        // Previous
        {
            // Previous positions
            positions: [{
                instrument: 'aapl',
                size: 4,
                openDate: 120,
                openPrice: 12,
                marginPrice: 12,
            }, {
                instrument: 'amzn',
                size: 10,
                openDate: 119,
                openPrice: 9.2,
                marginPrice: 9.2,
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
            marginPrice: 12.25,
        }, {
            instrument: 'amzn',
            size: -2,
            openDate: 123,
            openPrice: 11.2,
            marginPrice: 11.2,
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


test('calculates amount available based on traded (and not all) instruments', (t) => {
    const result = tradeForDate(
        // Date
        123,
        // Open prices
        new Map([['aapl', 12.5], ['amzn', 31.2]]),
        // Close prices
        new Map([['aapl', 15.8], ['amzn', 33.7]]),
        // instructionField prices
        new Map([['aapl', 15.8], ['amzn', 33.7]]),
        // Instructions to create new orders from
        [{
            instrument: 'aapl',
            weight: 2,
            selected: -1,
            rebalance: true,
        }],
        // Config
        {
            investedRatio: 1,
            maxRatioPerInstrument: 1,
            getPointValue: () => 1,
        },
        // Margins
        [],
        // Previous
        {
            // Previous positions
            positions: [{
                instrument: 'amzn',
                size: 10,
                openDate: 119,
                openPrice: 9.2,
                marginPrice: 9.2,
            }, {
                instrument: 'aapl',
                size: 5,
                openDate: 118,
                openPrice: 12.2,
                marginPrice: 12.2,
            }],
            // Previous positionValues (not relevant here)
            positionValues: new Map(),
            // Previous cash
            cash: 100,
            // Orders from previous bar
            orders: new Map(),
        },
    );

    t.deepEqual(
        result.orders,
        // Amount available for aapl order is
        // 100 cash
        // plus 15.8 * 5 (close for current position) = 79
        // total = 179
        // This is the smallest number amongst (0.9 * totalValue) or (0.8 * totalValue per
        // instrument), therefore we should use it.
        // 179 / 15.8 = 11.33 => -11
        // Current position is 5, order must therefore be -16
        new Map([['aapl', -16]]),
    );

});


test('ignores rebalances if set to false', (t) => {
    const result = tradeForDate(
        // Date
        123,
        // Open prices
        new Map([['aapl', 12.5]]),
        // Close prices
        new Map([['aapl', 15.8]]),
        // instructionField prices
        new Map([['aapl', 15.8]]),
        // Instructions to create new orders from
        [{
            instrument: 'aapl',
            weight: 2,
            selected: -1,
            rebalance: false,
        }],
        // Config
        {
            investedRatio: 0.9,
            maxRatioPerInstrument: 0.5,
            getPointValue: () => 1,
        },
        // Margins
        [],
        // Previous
        {
            // Previous positions (must exist; only if position exists *and* is part of new orders,
            // it's a rebalance)
            positions: [{
                size: -20,
                instrument: 'aapl',
                openDate: 119,
                openPrice: 9.2,
                marginPrice: 0.2,
            }],
            // Previous positionValues (not relevant here)
            positionValues: new Map(),
            // Previous cash
            cash: 100,
            // Orders from previous bar
            orders: new Map(),
        },
    );

    t.deepEqual(result.orders, new Map());

});



test('creates orders depending on instructionField prices', (t) => {
    const result = tradeForDate(
        // Date
        123,
        // Open prices
        new Map([['aapl', 12.5]]),
        // Close prices
        new Map([['aapl', 15.8]]),
        // instructionField prices
        new Map([['aapl', 3]]),
        // Instructions to create new orders from
        [{
            instrument: 'aapl',
            weight: 2,
            selected: -1,
        }],
        // Config
        {
            investedRatio: 1,
            maxRatioPerInstrument: 1,
            getPointValue: () => 1,
        },
        // Margins
        [],
        // Previous
        {
            // Previous positions
            positions: [],
            // Previous positionValues (not relevant here)
            positionValues: new Map(),
            // Previous cash
            cash: 100,
            // Orders from previous bar
            orders: new Map(),
        },
    );

    // 100, prices is 3; selected is -1 => -33
    t.deepEqual(result.orders, new Map([['aapl', -33]]));

});



test('uses pointValue if provided', (t) => {
    const result = tradeForDate(
        // Date
        123,
        // Open prices
        new Map([['aapl', 12.5]]),
        // Close prices
        new Map([['aapl', 15.8]]),
        // instructionField prices
        new Map([['aapl', 15.8]]),
        // Instructions to create new orders from
        [{
            instrument: 'aapl',
            weight: 2,
            selected: -1,
        }],
        // Config
        {
            investedRatio: 1,
            maxRatioPerInstrument: 1,
            // Check arguments
            getPointValue: (instrument, date) => {
                t.is(instrument, 'aapl');
                t.is(date, 123);
                return 40;
            },
        },
        // Margins
        [],
        // Previous
        {
            // Previous positions
            positions: [],
            // Previous positionValues (not relevant here)
            positionValues: new Map(),
            // Previous cash
            cash: 10000,
            // Orders from previous bar
            orders: new Map(),
        },
    );

    // Cash 10000, prices is 15.8 * 40 = 632
    t.deepEqual(result.orders, new Map([['aapl', -15]]));

});


