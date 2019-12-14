import test from 'ava';
import createDefaultConfiguration from './createDefaultConfiguration.mjs';

test('returns config', (t) => {
    const config = createDefaultConfiguration();
    t.is(config.investedRatio, 1);
    t.is(config.maxRatioPerInstrument, 1);
    t.is(config.getMargin(), 1);
    t.is(config.getPointValue(), 1);
    t.is(config.instructionField, 'close');
});
