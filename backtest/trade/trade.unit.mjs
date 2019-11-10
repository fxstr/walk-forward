import test from 'ava';
import trade from './trade.mjs';
import createTestData from '../testData/createTestData.mjs';
import walkStructure from '../dataHelpers/walkStructure.mjs';

const createInstruction = (instrument, day, selected = 1, weight = 1) => ({
    instrument,
    date: new Date(2019, 0, day, 0, 0, 0).getTime(),
    weight,
    selected,
    trade: true,
});

test('throws on invalid config', (t) => {
    t.throws(() => trade(0)(), /capital that is a number/);
});

test('converts data as expected', (t) => {
    const { data } = createTestData();

    // Update/overwrite instructions
    const findInstructionIndex = (instrument, date) => item => item.date === date &&
        item.instrument === instrument;
    [
        createInstruction('aapl', 1, -1, 2),
        createInstruction('amzn', 2, 1, 3),
        createInstruction('aapl', 2, -1, 2),
        // Weight 0 closes position
        createInstruction('aapl', 6, 1, 0),
    ].forEach((item) => {
        const index = data.instructions.findIndex(findInstructionIndex(item.instrument, item.date));
        if (index === -1) throw new Error(`trade.unit: Index not found for ${JSON.stringify(item)}`);
        data.instructions[index] = item;
    });

    data.configuration.investedRatio = 0.9;
    data.configuration.maxRatioPerInstrument = 0.8;

    const result = trade({ capital: 1000 })(data);

    // Jan 1
    t.deepEqual(result[0], {
        date: new Date(2019, 0, 1, 0, 0, 0).getTime(),
        positions: [],
        // aapl closed at 14.1, cash is 1000*0.8
        orders: new Map([['aapl', -56]]),
        positionValues: new Map(),
        cash: 1000,
    });

    // Jan 2
    // Short 56 aapl@13.9 in the morning
    const jan2 = new Date(2019, 0, 2, 0, 0, 0).getTime();
    t.deepEqual(result[1], {
        date: jan2,
        positions: [{
            instrument: 'aapl',
            size: -56,
            openDate: jan2,
            openPrice: 13.9,
        }],
        // aapl opened@13.9, close@13.1, +0.8/instrument = 56 * (13.9 + 0.8) = 823.2
        positionValues: new Map([['aapl', 56 * (13.9 + 0.8)]]),
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
    const jan3 = new Date(2019, 0, 3, 0, 0, 0).getTime();
    t.deepEqual(result[2], {
        date: jan3,
        positions: [
            // aapl stays the same, no data available for today
            {
                instrument: 'aapl',
                size: -56,
                openDate: jan2,
                openPrice: 13.9,
            },
            // Bought 25 amzn@21.8
            {
                instrument: 'amzn',
                size: 25,
                openDate: jan3,
                openPrice: 21.8,
            },
        ],
        // Aapl unchanged, amzn 25@22 (evening)
        positionValues: new Map([['aapl', 823.2], ['amzn', 25 * 22]]),
        // Had 221.6, bought 25 amzn@21.8 = 545
        cash: 221.6 - (25 * 21.8),
        // aapl stays open, could not be bought
        orders: new Map([['aapl', 28]]),
    });

    // Jan 4
    // aapl will be executed
    const jan4 = new Date(2019, 0, 4, 0, 0, 0).getTime();
    t.deepEqual(result[3], {
        date: jan4,
        positions: [
            // aapl becomes -28
            {
                instrument: 'aapl',
                size: -28,
                // Position size was reduced, openDate and openPrice stay the same
                openDate: jan2,
                openPrice: 13.9,
            },
            // amzn stays the same
            {
                instrument: 'amzn',
                size: 25,
                openDate: jan3,
                openPrice: 21.8,
            },
        ],
        // aapl shorted @13.9, now at 14.3 (loss 0.4/instrument), amzn 25@22.3 (evening)
        positionValues: new Map([['aapl', 28 * (13.9 - 0.4)], ['amzn', 25 * 22.3]]),
        // Had -323.4, covered 28 aapl@14.1 (loss 0.2/instrument, bought @13.9)
        cash: -323.4 + (28 * (13.9 - 0.2)),
        orders: new Map(),
    });

    // Jan 5: No data

    // Jan 6
    // Close aapl
    const jan6 = new Date(2019, 0, 6, 0, 0, 0).getTime();
    t.deepEqual(result[4], {
        date: jan6,
        // Positions are unchanged
        positions: [
            {
                instrument: 'aapl',
                size: -28,
                openDate: jan2,
                openPrice: 13.9,
            },
            {
                instrument: 'amzn',
                size: 25,
                openDate: jan3,
                openPrice: 21.8,
            },
        ],
        // aapl shorted @13.9, now at 13.6 (loss 0.3/instrument), amzn 25@22.3 (from jan 4)
        positionValues: new Map([['aapl', 28 * (13.9 + 0.3)], ['amzn', 25 * 22.3]]),
        // Same as previous (60.2; we cannot used that number, as JS gets 60.200000000000045)
        cash: -323.4 + (28 * (13.9 - 0.2)),
        // Cover aapl
        orders: new Map([['aapl', 28]]),
    });

    // Jan 6
    // Close aapl
    const jan7 = new Date(2019, 0, 7, 0, 0, 0).getTime();
    t.deepEqual(result[5], {
        date: jan7,
        positions: [
            // aapl was closed
            // amzn is unchanged
            {
                instrument: 'amzn',
                size: 25,
                openDate: jan3,
                openPrice: 21.8,
            },
        ],
        // amzn 25@22.3 (from jan 4)
        positionValues: new Map([['amzn', 25 * 22.3]]),
        // Was 60.2; covered 28 aapl@13.4 (from 13.9; gain 0.5/instrument)
        cash: 60.200000000000045 + (28 * (13.9 + 0.5)),
        orders: new Map(),
    });

});

test('does not modify original data', (t) => {
    const { data } = createTestData();
    data.instructions[0] = createInstruction('aapl', 1, -1, 2);
    const clone = walkStructure(data);
    trade({ capital: 1000 })(data);
    t.deepEqual(clone, data);
});
