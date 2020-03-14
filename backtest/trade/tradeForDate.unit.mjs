import test from 'ava';
import tradeForDate from './tradeForDate.mjs';

const setupData = () => {

    const aaplPosition = {
        instrument: 'aapl',
        size: 4,
        value: 0, // Not relevant here
        created: {
            barsSince: 5,
            price: 12,
            marginPrice: 12,
            pointValue: 1,
        },
    };

    const previousPositions = [
        // Open position should be ingored
        { ...aaplPosition, type: 'open' },
        { ...aaplPosition, type: 'close' },
        {
            instrument: 'amzn',
            size: 10,
            type: 'close',
            value: 0,
            created: {
                barsSince: 6,
                price: 9.2,
                marginPrice: 9.2,
                pointValue: 1,
            },
        },
    ];

    const previous = {
        // Previous positions
        positions: previousPositions,
        // Previous positionValues (not relevant here)
        positionValues: new Map(),
        // Previous cash
        cash: 100,
        // Orders from previous bar
        orders: new Map([['aapl', 4], ['amzn', -12]]),
    };

    const instructions = [{
        instrument: 'aapl',
        weight: 2,
        selected: -1,
        rebalance: true,
    }, {
        instrument: 'amzn',
        weight: 3,
        selected: 1,
        rebalance: true,
    }];

    const prices = {
        open: new Map([['aapl', 12.5], ['amzn', 11.2]]),
        close: new Map([['aapl', 15.8], ['amzn', 13.7]]),
        instructions: new Map([['aapl', 15.8], ['amzn', 13.7]]),
    };

    const pointValues = new Map([['aapl', 1], ['amzn', 1]]);

    return {
        previous,
        instructions,
        prices,
        pointValues,
    };


};




test('trades as expected', (t) => {

    const {
        previous,
        instructions,
        prices,
        pointValues,
    } = setupData();

    const result = tradeForDate(
        // Date
        123,
        // Open prices
        prices.open,
        // Close prices
        prices.close,
        // instructionField prices
        prices.instructions,
        // Instructions to create new orders from
        instructions,
        // Point values (same as open prices)
        pointValues,
        // Config
        {
            investedRatio: 0.9,
            maxRatioPerInstrument: 0.5,
        },
        // Margins (default to 1)
        new Map(),
        // Previous
        previous,
    );

    const [, previousAapl, previousAmzn] = previous.positions;

    t.deepEqual(result, {
        date: 123,
        positions: [
            // Open aapl
            {
                ...previousAapl,
                // 4 * 12.5 = 50
                value: 50,
                type: 'open',
                created: {
                    ...previousAapl.created,
                    barsSince: previousAapl.created.barsSince + 1,
                },
            },
            // Open amzn
            {
                ...previousAmzn,
                // 10 * 11.2 = 112
                value: 112,
                type: 'open',
                created: {
                    ...previousAmzn.created,
                    barsSince: previousAmzn.created.barsSince + 1,
                },
            },
            // Close aapl
            {
                ...previousAapl,
                // Had 4, bought 4
                size: 8,
                // - aapl 8@15.8 = 126.4
                value: 126.4,
                created: {
                    ...previousAapl.created,
                    barsSince: previousAapl.created.barsSince + 1,
                    // Were 4@12, plus new 4@12.5 open = 12.25 (average)
                    price: 12.25,
                    marginPrice: 12.25,
                },
            },
            // Close amzn
            {
                ...previousAmzn,
                // Had 10, order -12
                size: -2,
                // - amzn -2@13.7, opened at 11.2, loss of 2.5/instr = 17.4
                value: 17.4,
                created: {
                    // position is turned, barsSince is 0
                    barsSince: 0,
                    price: 11.2,
                    marginPrice: 11.2,
                    pointValue: 1,
                },
            },
        ],
        // positionValues: new Map([['aapl', 126.4], ['amzn', 17.4]]),
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

    const {
        previous,
        instructions,
        pointValues,
        prices,
    } = setupData();

    previous.orders = new Map();

    const result = tradeForDate(
        // Date
        123,
        // Open prices
        prices.open,
        // Close prices
        prices.close,
        // instructionField prices
        prices.instructions,
        // Instructions to create new orders from
        [instructions[0]],
        // Point values
        pointValues,
        // Config
        {
            investedRatio: 0.9,
            maxRatioPerInstrument: 0.8,
        },
        // Margins
        new Map(),
        // Previous
        previous,
    );

    t.deepEqual(
        result.orders,
        // Amount available for aapl order is
        // 100 cash
        // amzn has no orders, is therefore blocked
        // aapl 4 * 15.8 = 63.2
        // Total = 163.2
        // Available for 1 instrument is maxRatioPerInstrument: 0.8 * 163.2 = 130.56
        // Current price (close) for aapl is 15.8
        // 130.56 / 15.8 = 8.26, selected is -1 – expected position is -8
        // Current position is 4, order must therefore be -12
        new Map([['aapl', -12]]),
    );

});


test('ignores rebalances if instructions.rebalance is set to false', (t) => {

    const {
        previous,
        instructions: originalInstructions,
        pointValues,
        prices,
    } = setupData();

    // Don't change previous positions – use them on close (to calculate new positions) as
    // they existed on the day before.
    previous.orders = new Map();

    const instructions = originalInstructions.map(instruction => ({
        ...instruction,
        // Order must be in same direction as existing position; if it's not, it's not a rebalance
        // but a new position.
        selected: 1,
        rebalance: false,
    }));

    const result = tradeForDate(
        // Date
        123,
        // Open prices
        prices.open,
        // Close prices
        prices.close,
        // instructionField prices
        prices.instructions,
        // Instructions to create new orders from
        instructions,
        // Point values
        pointValues,
        // Config
        {
            investedRatio: 0.9,
            maxRatioPerInstrument: 0.5,
        },
        // Margins
        new Map(),
        // Previous
        // Previous positions (must exist; only if position exists *and* is part of new orders,
        // it's a rebalance)
        previous,
    );

    t.deepEqual(result.orders, new Map());

});



test('creates orders depending on instructionField prices', (t) => {

    const {
        instructions,
        pointValues,
        prices,
    } = setupData();

    prices.instructions.set('aapl', 3);
    const aaplInstructions = instructions.slice(0, 1);

    const result = tradeForDate(
        // Date
        123,
        // Open prices
        prices.open,
        // Close prices
        prices.close,
        // instructionField prices
        prices.instructions,
        // Instructions to create new orders from
        aaplInstructions,
        // Point values
        pointValues,
        // Config
        {
            investedRatio: 1,
            maxRatioPerInstrument: 1,
        },
        // Margins
        [],
        // Previous
        {
            // Previous positions
            positions: [],
            // Previous positionValues (not relevant here)
            cash: 100,
            // Orders from previous bar
            orders: new Map(),
        },
    );

    // 100, prices is 3; selected is -1 => -33
    t.deepEqual(result.orders, new Map([['aapl', -33]]));

});



test('uses pointValue if provided', (t) => {

    const {
        instructions,
        prices,
    } = setupData();

    const aaplInstruction = instructions.slice(0, 1);

    const result = tradeForDate(
        // Date
        123,
        // Open prices
        prices.open,
        // Close prices
        prices.close,
        // instructionField prices
        prices.instructions,
        // Instructions to create new orders from
        aaplInstruction,
        // Point values
        new Map([['aapl', 40]]),
        // Config
        {
            investedRatio: 1,
            maxRatioPerInstrument: 1,
        },
        // Margins
        [],
        // Previous
        {
            // Previous positions
            positions: [],
            // Previous positionValues (not relevant here)
            cash: 10000,
            // Orders from previous bar
            orders: new Map(),
        },
    );

    // Cash 10000, prices is 15.8 * 40 = 632
    t.deepEqual(result.orders, new Map([['aapl', -15]]));

});


