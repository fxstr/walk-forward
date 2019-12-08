import test from 'ava';
import getAmounts from './getAmounts.mjs';

test('returns expected values without ratios', (t) => {
    const { maxAmount, maxAmountPerInstrument } = getAmounts(1000, 500, 800);
    t.is(maxAmount, 1500);
    t.is(maxAmountPerInstrument, 1800);
});

test('respects investedRatio', (t) => {
    const { maxAmount, maxAmountPerInstrument } = getAmounts(1000, 800, 800, 0.8);
    t.is(maxAmount, 1440);
    t.is(maxAmountPerInstrument, 1800);
});

test('respects untouchable amount for investedRatio', (t) => {
    const { maxAmount, maxAmountPerInstrument } = getAmounts(1000, 500, 800, 0.8);
    // 1800 * 0.8 = 1440; as 300 are already invested (800 total - 500 traded today), this
    // becomes 1140.
    t.is(maxAmount, 1140);
    t.is(maxAmountPerInstrument, 1800);
});

test('respects maxRatioPerInstrument', (t) => {
    const { maxAmount, maxAmountPerInstrument } = getAmounts(1000, 500, 800, 1, 0.4);
    t.is(maxAmount, 1500);
    // Max (1000 + 800) * 0.4
    t.is(maxAmountPerInstrument, 720);
});
