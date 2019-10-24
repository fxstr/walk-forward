import test from 'ava';
import addIndicator from './addIndicator.mjs';
import createTestData from '../testData/createTestData.mjs';
import findInTimeSeries from '../dataHelpers/findInTimeSeries.mjs';


test('returns a promise', (t) => {
    const { data } = createTestData();
    const promise = addIndicator(data, () => []);
    t.is(promise instanceof Promise, true);
});


test('throws if indicator entry is not valid', async(t) => {
    const { data } = createTestData();
    const missingDate = () => [new Map()];
    await t.throwsAsync(addIndicator(data, missingDate), /without a date/);
    const missingInstrument = () => [new Map([['date', 1]])];
    await t.throwsAsync(addIndicator(data, missingInstrument), /without an instrument/);
    const noMatch = () => [new Map([['date', 1], ['instrument', 'xyz']])];
    await t.throwsAsync(addIndicator(data, noMatch), /not found in time series/);
});


test('adds indicator data correctly', async(t) => {

    const { data, instrumentKey } = createTestData();
    const timeStamp = new Date(2019, 0, 2, 0, 0, 0).getTime();

    const indicatorData = [
        new Map([
            ['instrument', 'aapl'],
            ['date', timeStamp],
            ['sma15', 3],
            ['sma30', 5],
        ]),
        // Also test what happens if there is a second return value on indicator
        new Map([
            ['instrument', 'aapl'],
            ['date', new Date(2019, 0, 4, 0, 0, 0).getTime()],
            ['sma15', 4],
            ['sma30', 6],
        ]),
    ];

    // Test async indicator function
    const indicatorFunction = () => new Promise(resolve =>
        setTimeout(() => resolve(indicatorData)));

    /* const viewOptions = {
        panel: {
            height: 0.5,
            identifier: 'testPanel',
        },
        series: new Map([
            ['sma15', { type: 'line' }],
        ]),
    }; */

    const result = await addIndicator(data, indicatorFunction);

    const aapl = findInTimeSeries(
        result,
        'aapl',
        timeStamp,
    );

    t.deepEqual(aapl, new Map([
        ['date', timeStamp],
        ['open', 13.9],
        ['close', 13.1],
        [instrumentKey, 'aapl'],
        ['sma15', 3],
        ['sma30', 5],
    ]));

    /* t.deepEqual(result.viewOptions, {
        panels: new Map([
            ['testPanel', { height: 0.5 }],
        ]),
        series: new Map([
            ['sma15', { panel: 'testPanel', type: 'line' }],
            ['sma30', { panel: 'testPanel' }],
        ]),
    }); */


});
