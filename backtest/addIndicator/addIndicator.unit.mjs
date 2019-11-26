import test from 'ava';
import addIndicator from './addIndicator.mjs';
import createTestData from '../testData/createTestData.mjs';
import walkStructure from '../dataHelpers/walkStructure.mjs';
import sortBy from '../dataHelpers/sortBy.mjs';

const setupData = () => {
    const { data } = createTestData();
    // TODO: Remove when createTestData is sorted
    data.timeSeries.sort(sortBy('date', data.instrumentKey));
    const indicatorData = data.timeSeries.map((entry, index) => new Map([
        ['date', entry.get('date')],
        ['instrument', entry.get(data.instrumentKey)],
        ['indicatorName', index],
    ]));

    return { data, indicatorData };
};


test('throws if indicator entry is not valid', async(t) => {
    const { data } = setupData();
    const missingDate = () => [new Map()];
    await t.throwsAsync(addIndicator(data, missingDate), /without a date/);
    const missingInstrument = () => [new Map([['date', 1]])];
    await t.throwsAsync(addIndicator(data, missingInstrument), /without an instrument/);
});


test('throws if length does not correspond', async(t) => {
    const { data, indicatorData } = setupData();
    const tooShort = () => indicatorData.slice(0, -1);
    await t.throwsAsync(addIndicator(data, tooShort), /Length of data returned by indicator/);
});


test('throws if date at index is not equal', async(t) => {
    const { data, indicatorData } = setupData();
    indicatorData[indicatorData.length - 1].set('date', 1234);
    const wrongDate = () => indicatorData;
    await t.throwsAsync(addIndicator(data, wrongDate), /Date for timeSeries and indicator data at same position/);
});


test('returns a promise', (t) => {
    const { data, indicatorData } = setupData();
    const promise = addIndicator(data, () => indicatorData);
    t.is(promise instanceof Promise, true);
});


test('adds indicator data correctly', async(t) => {

    const { data, indicatorData } = setupData();

    // Test async indicator function
    const indicatorFunction = () => new Promise(resolve =>
        setTimeout(() => resolve(indicatorData)));

    const result = await addIndicator(data, indicatorFunction);

    const firstResult = result.timeSeries[0];
    t.is(firstResult.size, 5);
    // Don't check exact Map as we don't care about the order of its entries
    // Make sure 'instrument' has been removed from map
    t.is(firstResult.get('date'), new Date(2019, 0, 1, 0, 0, 0).getTime());
    t.is(firstResult.get('open'), 13.2);
    t.is(firstResult.get('close'), 14.1);
    t.is(firstResult.get(data.instrumentKey), 'aapl');
    t.is(firstResult.get('indicatorName'), 0);

    t.deepEqual(
        result.timeSeries.map(entry => entry.get('indicatorName')),
        // First all aapl, then all amzn
        [0, 1, 2, 3, 4, 5, 6, 7],
    );

});


test('does not modify original data', async(t) => {
    const { data, indicatorData } = setupData();
    const originalData = walkStructure(data);

    const indicatorFunction = () => indicatorData;
    await addIndicator(data, indicatorFunction);

    t.deepEqual(data, originalData);
});



