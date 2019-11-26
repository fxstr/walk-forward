import test from 'ava';
import talib from 'talib';
import talibIndicator from './talibIndicator.mjs';
import createTestData from '../testData/createTestData.mjs';


test('fails if data is missing', (t) => {
    t.throws(() => talibIndicator(), /Parameter name/);
    t.throws(() => talibIndicator({ name: 'test' }), /Parameter inputs/);
    t.throws(() => talibIndicator({ name: 'test', inputs: 'notAnObject' }), /Parameter inputs/);
    t.throws(() => talibIndicator({ name: 'test', inputs: {} }), /Parameter options/);
    t.throws(() => talibIndicator({
        name: 'test',
        inputs: {},
        options: 'notAnObject',
    }), /Parameter options/);
    t.throws(() => talibIndicator({ name: 'test', inputs: {}, options: {} }), /Parameter outputs/);
    t.throws(() => talibIndicator({
        name: 'test',
        inputs: {},
        options: {},
        outputs: 'notAnObject',
    }), /Parameter outputs/);
});


test('returns a function', (t) => {
    const params = {
        name: 'test',
        inputs: {},
        options: {},
        outputs: {},
    };
    t.is(typeof talibIndicator(params), 'function');
});

test('returns data as expected', async(t) => {
    const { data } = createTestData();
    const result = await talibIndicator({
        name: 'SMA',
        options: { optInTimePeriod: 2 },
        inputs: { inReal: 'close' },
        outputs: { outReal: 'sma' },
    })(data);
    t.deepEqual(
        result[0],
        new Map([...data.timeSeries[0], ['sma', undefined]]),
    );
    t.deepEqual(
        result[1],
        new Map([...data.timeSeries[1], ['sma', 13.6]]),
    );
});


// TODO: Automatically test for every indicator that Talib provides :-
test('converts data as expected', (t) => {
    const indicators = talib.functions;
    const promises = indicators.map((indicator) => {
        const explanation = talib.explain(indicator.name);
    });
    t.pass();
});
