/**
 * Integration test for addIndicator and talibIndicator
 */
import test from 'ava';
import addIndicator from './addIndicator.mjs';
import talibIndicator from '../talibIndicator/talibIndicator.mjs';
import createTestData from '../testData/createTestData.mjs';
import findInTimeSeries from '../dataHelpers/findInTimeSeries.mjs';
import sortBy from '../dataHelpers/sortBy.mjs';

test('creates correct data', async(t) => {

    const { data, instrumentKey } = createTestData();
    // TODO: Remove sort
    data.timeSeries.sort(sortBy('date', data.instrumentKey));
    const result = await addIndicator(
        data,
        talibIndicator({
            name: 'SMA',
            inputs: { inReal: 'close' },
            outputs: { outReal: 'sma2' },
            options: { optInTimePeriod: 2 },
        }),
    );

    const firstAAPL = findInTimeSeries(result, 'aapl', new Date(2019, 0, 1, 0, 0, 0).getTime());
    // Check that no unnecessary fields were created
    t.deepEqual(Array.from(firstAAPL.keys()), ['date', 'open', 'close', instrumentKey, 'sma2']);
    t.is(firstAAPL.get('sma2'), undefined);

    const secondAAPL = findInTimeSeries(result, 'aapl', new Date(2019, 0, 2, 0, 0, 0).getTime());
    t.is(secondAAPL.get('sma2'), 13.6);


    // Check if we can add a second indicator on top of the first one (especially as the first
    // entry returned by SMA2 is undefined)
    const derivedResult = await addIndicator(
        result,
        talibIndicator({
            name: 'SMA',
            inputs: { inReal: 'sma2' },
            outputs: { outReal: 'sma22' },
            options: {
                optInTimePeriod: 2,
                // We must set startIdx to the index we want the first result to be calculated at
                startIdx: 2,
            },
        }),
    );

    const thirdDerivedAapl = findInTimeSeries(
        derivedResult,
        'aapl',
        new Date(2019, 0, 4, 0, 0, 0).getTime(),
    );
    // Result will not be 13.65 but 13.6499999999 …
    t.is(thirdDerivedAapl.get('sma22'), ((13.7 + 13.6) / 2));

});
