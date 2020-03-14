import test from 'ava';
import createTestResultData from '../testData/createTestResultData.mjs';
import getClosedPositions from './getClosedPositions.mjs';

test('returns closed positions', (t) => {

    // Use dynamic margin and pointValue to check if varying values are accounted for
    const data = createTestResultData();
    const result = getClosedPositions(data.result);

    // aapl: short 56@13.9 on jan2, revert@13.4 on jan6; no data on 3
    // amzn: buy 25@@21.8 on jan3, sell@21.6 on jan5
    // aapl: buy 54@13.4 on jan6, sell@13.4 on jan7
    t.deepEqual(result, [
        {
            instrument: 'amzn',
            // Bought on jan 3, closed on jan 4
            bars: 1,
            // Loss 5
            openValue: 25 * 21.8,
            closeValue: 25 * 21.6,
        },
        {
            instrument: 'aapl',
            // Jan 2 to jan 6, no data on 3 and 5
            bars: 2,
            // Open 2 @13.99 with margin 50%, then sell 1.
            openValue: 56 * 13.9,
            // Final rate (close day before) is 23
            closeValue: 56 * (13.9 + 0.5),
            // Gain 28
        },
        // aapl was inverted (equals closing an existing plus opening a new position)
        {
            instrument: 'aapl',
            // Shorted on jan 6, covered on jan 7
            bars: 1,
            openValue: 54 * 13.4,
            closeValue: 54 * 13.4,
            // Gain 0
        },
    ]);

});


test('respects pointValue and margin', (t) => {
    const data = createTestResultData({
        getPointValue: (instrument, date) => new Date(date).getDate(),
        getMargin: (instrument, entry) => new Date(entry.get('date')).getDate() / 10,
    });
    const result = getClosedPositions(data.result);
    t.deepEqual(result[0], {
        instrument: 'amzn',
        bars: 1,
        // Shorted 56 aapl on jan2 @ 13.9 with margin 0.2 and pointValue 2. Cost 311.36.
        // Cash on jan 2 close is 688.64. Value of aapl @ 13.1 is 400.96.
        // Jan 2: Money availailable is 1089.6. 90% of it is 980.64. Amzn gets 3/5 = 588.384.
        // Amzn: point value 2, margin 0.2, close 22.1
        // 588.384 / 22.1 / 2 = size 13. Opens at 21.8 on jan 3.
        // Open value is 13 * 21.8 * 3 (pointValue) * 0.3 (margin).
        openValue: 255.06,
        // Closed on jan 4 (point value 4, margin 0.4 does not matter, open price 21.6).
        // 21.6 * 4 = 86.4 per contract; original was 21.8 * 3 = 65.4; gain of 21 per contract
        // Original value is 255.06; plus 21 * 13 = 528.06
        closeValue: 528.06,
    });
});
