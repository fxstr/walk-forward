import test from 'ava';
import trade from './trade.mjs';
import createTestData from '../testData/createTestData.mjs';
import walkStructure from '../dataHelpers/walkStructure.mjs';
import createTestResultData from '../testData/createTestResultData.mjs';


const createInstruction = (instrument, day, selected = 1, weight = 1) => ({
    instrument,
    date: new Date(2019, 0, day, 0, 0, 0).getTime(),
    weight,
    selected,
    rebalance: true,
});



test('throws on invalid capital', (t) => {
    t.throws(() => trade(undefined, false), /capital that is a number/);
});


test('converts data for trade as expected', (t) => {

    const { result } = createTestResultData();

    // Jan 1
    t.deepEqual(result[0], {
        date: new Date(2019, 0, 1, 0, 0, 0).getTime(),
        positions: [],
        // aapl closed at 14.1, cash is 1000*0.8
        orders: new Map([['aapl', -56]]),
        cash: 1000,
    });

    // Jan 2
    // Short 56 aapl@13.9 in the morning
    t.deepEqual(result[1], {
        date: new Date(2019, 0, 2, 0, 0, 0).getTime(),
        // Position did not exist on open in the morning – only close is avaialble
        positions: [{
            instrument: 'aapl',
            size: -56,
            type: 'close',
            value: (13.9 + 0.8) * 56, // closes@13.1
            created: {
                barsSince: 0,
                price: 13.9,
                marginPrice: 13.9,
                pointValue: 1,
            },
        }],
        // aapl opened@13.9, close@13.1, +0.8/instrument = 56 * (13.9 + 0.8) = 823.2
        // positionValues: new Map([['aapl', 56 * (13.9 + 0.8)]]),
        // Shorted 63 aapl@13.9 = 875.7
        cash: 1000 - (13.9 * 56),
        // total amount: 1050.4
        // - cash: 124.3
        // - aapl (see positionValues): 926.1
        // Max per instrument is 840.32, max invested is 945.36
        // Total weight is 5, aapl@13.1 gets 40% (378.144), amzn@22.1 60% (567.216)
        // aapl target size is -28, current size is -56: buy 28
        orders: new Map([['aapl', 28], ['amzn', 25]]),
    });

    // Jan 3
    // Only data for amzn is available
    t.deepEqual(result[2], {
        date: new Date(2019, 0, 3, 0, 0, 0).getTime(),
        positions: [
            // aapl stays the same, no data available for today
            {
                instrument: 'aapl',
                size: -56,
                type: 'open',
                value: (13.9 + 0.8) * 56,
                created: {
                    // No data for today – does not count as a bar
                    barsSince: 0,
                    price: 13.9,
                    marginPrice: 13.9,
                    pointValue: 1,
                },
            },
            // aapl close
            {
                instrument: 'aapl',
                size: -56,
                type: 'close',
                value: (13.9 + 0.8) * 56,
                created: {
                    // No data for today – does not count as a bar
                    barsSince: 0,
                    price: 13.9,
                    marginPrice: 13.9,
                    pointValue: 1,
                },
            },
            // amzn close: Bought 25 amzn@21.8, closes@22
            {
                instrument: 'amzn',
                size: 25,
                type: 'close',
                value: 25 * 22,
                created: {
                    barsSince: 0,
                    price: 21.8,
                    marginPrice: 21.8,
                    pointValue: 1,
                },
            },
        ],
        // Aapl unchanged, amzn 25@22 (evening)
        // positionValues: new Map([['aapl', 823.2], ['amzn', 25 * 22]]),
        // Had 221.6, bought 25 amzn@21.8 = 545
        cash: 221.6 - (25 * 21.8),
        // aapl did not have any data available, is therefore removed
        // amzn is being closed, there are no instructions
        orders: new Map([['amzn', -25]]),
    });

    // Jan 4
    // aapl and amzn will be executed; reverse order for aapl is generated
    t.deepEqual(result[3], {
        date: new Date(2019, 0, 4, 0, 0, 0).getTime(),
        positions: [
            // aapl stays
            {
                instrument: 'aapl',
                size: -56,
                type: 'open',
                // aapl shorted @13.9, now at 14.1 (loss 0.2/instrument)
                value: 56 * (13.9 - 0.2),
                created: {
                    barsSince: 1,
                    price: 13.9,
                    marginPrice: 13.9,
                    pointValue: 1,
                },
            },
            // amzn position is still open on open
            {
                instrument: 'amzn',
                size: 25,
                type: 'open',
                // 25 amzn@21.6
                value: 25 * 21.6,
                created: {
                    barsSince: 1,
                    price: 21.8,
                    marginPrice: 21.8,
                    pointValue: 1,
                },
            },
            // amzn was completely sold; on close, there is only aapl
            {
                instrument: 'aapl',
                size: -56,
                type: 'close',
                // aapl shorted @13.9, now at 14.3 (loss 0.4/instrument)
                value: 56 * (13.9 - 0.4),
                created: {
                    barsSince: 1,
                    price: 13.9,
                    marginPrice: 13.9,
                    pointValue: 1,
                },
            },
        ],
        // Had -323.4, sold 25 amzn@21.6
        cash: -323.4 + (25 * 21.6),
        // Switch aapl position to long. Cash is 216.6, money in aapl is 56 * (13.9 - 0.4) = 756,
        // total is 972.6. Max per instrument is 0.8 = 778.08. aapl is at 14.3 = 54.
        // Was 56 short, becomes 54 long = +110
        orders: new Map([['aapl', 110]]),
    });

    // Jan 5: No data

    // Jan 6
    // Revert aapl
    t.deepEqual(result[4], {
        date: new Date(2019, 0, 6, 0, 0, 0).getTime(),
        // Positions are empty only on close
        positions: [{
            instrument: 'aapl',
            type: 'open',
            size: -56,
            // Shorted 56@13.9, now at 13.4, gain 0.5
            value: 56 * (13.9 + 0.5),
            created: {
                barsSince: 2,
                price: 13.9,
                marginPrice: 13.9,
                pointValue: 1,
            },
        }, {
            instrument: 'aapl',
            type: 'close',
            size: 54,
            // Shorted 56@13.9, now at 13.4, gain 0.5
            value: 54 * 13.6,
            created: {
                barsSince: 0,
                price: 13.4,
                marginPrice: 13.4,
                pointValue: 1,
            },
        }],
        // 216.6 from previous; covered 56 aapl@13.4 (from 13.9); bought 54 aapl@13.4
        cash: 299.4,
        orders: new Map([['aapl', -54]]),
    });

    // Jan 7
    // aapl closed
    t.deepEqual(result[5], {
        date: new Date(2019, 0, 7, 0, 0, 0).getTime(),
        // Positions are empty only on close
        positions: [{
            instrument: 'aapl',
            type: 'open',
            size: 54,
            // Shorted 56@13.9, now at 13.4, gain 0.5
            value: 54 * 13.4,
            created: {
                barsSince: 1,
                price: 13.4,
                marginPrice: 13.4,
                pointValue: 1,
            },
        }],
        // 216.6 from previous; sold 54 aapl@13.4
        cash: 299.4 + (54 * 13.4),
        orders: new Map(),
    });

});


test('does not modify original data', (t) => {
    const { data } = createTestData();
    data.instructions[0] = createInstruction('aapl', 1, -1, 2);
    const clone = walkStructure(data);
    trade(data, 1000);
    t.deepEqual(clone, data);
});


test('respects rebalance instructions', (t) => {

    const { data } = createTestData();
    data.instructions[0] = createInstruction('aapl', 1, -1, 2);
    // Create instruction on next day that has the same selected property, but set rebalance to
    // false
    data.instructions[1] = createInstruction('aapl', 1, -1, 4);
    data.instructions[1].rebalance = false;

    const { result } = trade(data, 1000);
    // aapl positions are exactly the same on jan 1 as on jan 2
    // [2][0] is open; to equal first, we must modify type to 'close'.
    t.deepEqual(result[1].positions[0], { ...result[2].positions[0], type: 'close' });

});


test('works with margins', (t) => {
    const { data } = createTestData();
    const jan2 = new Date(2019, 0, 2, 0, 0, 0).getTime();

    // Add field atr on aapl jan 2
    data.timeSeries[1].set('atr', 0.6);
    data.instructions[0] = createInstruction('aapl', 1, -1, 2);
    data.configuration.getMargin = (instrumentName, entry) => {
        // Check arguments
        if (instrumentName === 'aapl' && entry.get('date') === jan2) return entry.get('atr');
        return 1;
    };

    const { result } = trade(data, 1000);

    // Evening of Jan 1: 1000 / 14.1 = 70.92
    // Short 70 aapl@13.9 in the morning
    t.deepEqual(result[1].positions, [{
        instrument: 'aapl',
        size: -70,
        type: 'close',
        // Shorted 70 @ 13.9, is @13.1, gain 0.8/instrument = 56
        // Price paid was 13.9 * 0.6 * 70 = 583.8
        value: 56 + 583.8,
        created: {
            barsSince: 0,
            price: 13.9,
            marginPrice: 13.9 * 0.6,
            pointValue: 1,
        },
    }]);
    t.is(result[1].cash, 1000 - (70 * 13.9 * 0.6));

});


test('uses instructionField', (t) => {
    const { data } = createTestData();

    // Add field atr on aapl jan 2
    data.instructions[0] = createInstruction('aapl', 1, -1, 2);
    data.timeSeries[0].set('atr', 0.2);
    data.configuration.instructionField = 'atr';

    const { result } = trade(data, 1000);

    // Evening of Jan 1: 1000 / 0.2 (atr) = 5000
    // Short 5000 aapl@13.9 in the morning
    t.deepEqual(result[1].positions, [{
        instrument: 'aapl',
        size: -5000,
        // Shorted 5000 @ 13.9, is @13.1, gain 0.8/instrument = 4000
        // Price paid was 13.9 * 5000 = 69500
        value: 4000 + 69500,
        type: 'close',
        created: {
            barsSince: 0,
            price: 13.9,
            marginPrice: 13.9,
            pointValue: 1,
        },
    }]);
    // Shorted 5000 @ 13.9
    t.is(result[1].cash, 1000 - (5000 * 13.9));

});



test('uses getPointValue', (t) => {
    const { data } = createTestData();

    // Add field atr on aapl jan 2
    data.instructions[0] = createInstruction('aapl', 1, -1, 2);
    data.configuration.getPointValue = () => 4;

    const { result } = trade(data, 1000);

    // Evening of Jan 1: 1000 / (14.1 * 4)
    // Short 17 aapl@13.9 in the morning
    t.deepEqual(result[1].positions, [{
        instrument: 'aapl',
        size: -17,
        // Shorted 17 @ 13.9 * 4, is @13.1 * 4, gain 3.2/instrument = 54.4
        // Price paid was 17 * 13.9 * 4 = 945.2
        // JS numbers …
        value: 999.6000000000001,
        type: 'close',
        created: {
            barsSince: 0,
            price: 13.9,
            marginPrice: 13.9,
            pointValue: 4,
        },
    }]);
    // Shorted 17 @ 13.9 * 4
    t.is(result[1].cash, 1000 - (17 * 13.9 * 4));

});


