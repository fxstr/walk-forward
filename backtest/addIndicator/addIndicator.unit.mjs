import test from 'ava';
import addIndicator from './addIndicator.mjs';
import createTestData from '../testData/createTestData.mjs';
import walkStructure from '../dataHelpers/walkStructure.mjs';

const setupData = () => {
    const { data } = createTestData();
    const indicatorData = {
        ...data,
        timeSeries: data.timeSeries.map((entry, index) => new Map([
            ...entry,
            ['indicator', index],
        ])),
    };
    return { data, indicatorData };
};


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
    t.is(firstResult.get('date'), new Date(2019, 0, 1, 0, 0, 0).getTime());
    t.is(firstResult.get('open'), 13.2);
    t.is(firstResult.get('close'), 14.1);
    t.is(firstResult.get(data.instrumentKey), 'aapl');
    t.is(firstResult.get('indicator'), 0);

    t.deepEqual(
        result.timeSeries.map(entry => entry.get('indicator')),
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



