import test from 'ava';
import stats from 'simple-statistics';
import rSquared from './rSquared.mjs';
import createTestData from '../testData/createTestData.mjs';

const getRSquared = (...data) => {
    const samples = data.map((entry, index) => [index, entry]);
    const line = stats.linearRegressionLine(stats.linearRegression(samples));
    return stats.rSquared(samples, line);
};

test('fails on invalid options', (t) => {
    const { data } = createTestData();
    const options = { inputs: new Map(), outputs: new Map() };
    t.throws(() => rSquared(options)(data), /must contain options.multiplier/);
    options.options = {};
    t.throws(() => rSquared(options)(data), /must contain options.multiplier/);
    options.options.length = 'test';
    t.throws(() => rSquared(options)(data), /must contain options.multiplier/);
});


test('returns expected values', (t) => {
    const { data } = createTestData();
    const options = {
        inputs: new Map([['close', 'in']]),
        outputs: new Map([['out', 'rSquared']]),
        options: { length: 3 },
    };
    const result = rSquared(options)(data);
    const values = [
        undefined,
        undefined,
        undefined,
        undefined,
        getRSquared(14.1, 13.1, 14.3),
        getRSquared(22.1, 22, 22.3),
        getRSquared(13.1, 14.3, 13.6),
        getRSquared(14.3, 13.6, 13.1),
    ];
    const expectation = data.timeSeries.map((item, index) => {
        const clone = new Map(item);
        clone.set('rSquared', values[index]);
        return clone;
    });
    t.deepEqual(result.timeSeries, expectation);
});
