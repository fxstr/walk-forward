import test from 'ava';
import createTestResultData from '../testData/createTestResultData.mjs';
import getClosedPositions from './getClosedPositions.mjs';

test('returns closed positions', (t) => {
    const data = createTestResultData();
    const result = getClosedPositions(data.result);
    t.deepEqual(result, [
        {
            instrument: 'aapl',
            // Jan 2
            openDate: 1546383600000,
            // Jan 7
            closeDate: 1546815600000,
            // Open 2 @19 with margin 50%, then sell 1.
            openValue: 9.5,
            // Final rate (close day before) is 23
            closeValue: 13.5,
        },
        // Amzn was inverted (equals closing an existing plus opening a new position)
        {
            instrument: 'amzn',
            // Jan 4
            openDate: 1546556400000,
            // Jan 7
            closeDate: 1546988400000,
            // Short 4 @10, 4@12, mean is 11, margin is 50%
            openValue: 44,
            // Value of previous close is used: is 68
            closeValue: 26,
        },
    ]);

});
