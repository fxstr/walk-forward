import test from 'ava';
import executeTalibIndicator from './executeTalibIndicator.mjs';

const setupData = () => {
    const talibOptions = {
        name: 'SMA',
        startIdx: 0,
        endIdx: 5,
        inReal: [5, 7, 5, 8, 9, 8],
        optInTimePeriod: 2,
    };
    return { talibOptions };
};

test('returns promise', (t) => {
    const { talibOptions } = setupData();
    const promise = executeTalibIndicator(talibOptions);
    t.is(promise instanceof Promise, true);
});

test('fails with invalid data', async(t) => {
    const { talibOptions } = setupData();
    delete talibOptions.inReal;
    try {
        await executeTalibIndicator(talibOptions);
        t.fail();
    }
    catch (err) {
        t.is(err.message.includes('inReal'), true);
    }

});

test('fills up every value if none is returned', async(t) => {
    // SMA(100) on a data set of 10 will not return begIndex, we must fill data up ourselves
    const { talibOptions } = setupData();
    talibOptions.optInTimePeriod = 10;
    const result = await executeTalibIndicator(talibOptions);
    t.deepEqual(result, {
        outReal: Array.from({ length: talibOptions.inReal.length }, () => undefined),
    });
});

test('executes talib', async(t) => {
    const { talibOptions } = setupData();
    const result = await executeTalibIndicator(talibOptions);
    t.deepEqual(result, {
        outReal: [undefined, 6, 6, 6.5, 8.5, 8.5],
    });
});
