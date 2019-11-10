import test from 'ava';
import createDefaultConfiguration from './createDefaultConfiguration.mjs';

test('returns config', (t) => {
    t.deepEqual(createDefaultConfiguration(), {
        investedRatio: 1,
        maxRatioPerInstrument: 1,
    });
});
