import test from 'ava';
import getAmounts from './getAmounts.mjs';

test('throws on invalid values', (t) => {
    t.throws(() => getAmounts({ cash: 4, trading: 5 }), /cash/);
    t.throws(() => getAmounts({ bound: 4, trading: 5 }), /cash/);
    t.throws(() => getAmounts({ cash: 4, bound: 5 }), /cash/);
    t.throws(() => getAmounts({
        cash: 4,
        bound: 5,
        trading: 3,
        investedRatio: 'test',
    }), /investedRatio/);
    t.throws(() => getAmounts({
        cash: 4,
        bound: 5,
        trading: 3,
        ratioPerInstrument: 'test',
    }), /investedRatio/);
});


test('returns expected values without ratios', (t) => {
    const { maxAmount, maxAmountPerInstrument } = getAmounts({
        cash: 1000,
        trading: 500,
        bound: 300,
    });
    t.is(maxAmount, 1500);
    t.is(maxAmountPerInstrument, 1500);
});


test('respects investedRatio', (t) => {
    const { maxAmount, maxAmountPerInstrument } = getAmounts({
        cash: 1000,
        trading: 800,
        bound: 0,
        investedRatio: 0.8,
    });
    // (1000 + 800 + 0) * 0.8 = 1440
    t.is(maxAmount, 1440);
    t.is(maxAmountPerInstrument, 1440);
});


test('respects untouchable amount for investedRatio', (t) => {
    const { maxAmount, maxAmountPerInstrument } = getAmounts({
        cash: 1000,
        trading: 800,
        bound: 200,
        investedRatio: 0.8,
    });
    // 2000 * 0.8 = 1600 minus 200 already invested = 1400
    t.is(maxAmount, 1400);
    t.is(maxAmountPerInstrument, 1400);
});


test('respects maxRatioPerInstrument', (t) => {
    const { maxAmount, maxAmountPerInstrument } = getAmounts({
        cash: 1000,
        trading: 500,
        bound: 300,
        ratioPerInstrument: 0.4,
    });
    // 1800 * 1 - 300 bound
    t.is(maxAmount, 1500);
    // 1800 * 0.4 = 720
    t.is(maxAmountPerInstrument, 720);
});


test('works with negative value of trading positions', (t) => {
    // trading or bound can be negative – make sure we don't get back a negative
    // maxAmount
    const { maxAmount, maxAmountPerInstrument } = getAmounts({
        cash: 1000,
        trading: -1600,
        bound: 500,
    });
    t.is(maxAmount === 0, true);
    t.is(maxAmountPerInstrument === 0, true);
});


test('works with negative value of bound positions', (t) => {
    // trading or bound can be negative – make sure we don't get back a negative
    // maxAmount
    const { maxAmount, maxAmountPerInstrument } = getAmounts({
        cash: 1000,
        trading: 1600,
        bound: -500,
    });
    // Total: 1000 + 1600 - 500 = 2100
    // maxAmount: 2100
    t.is(maxAmount === 2100, true);
    t.is(maxAmountPerInstrument === 2100, true);
});


test('works with negative value of bound and trading positions', (t) => {
    // trading or bound can be negative – make sure we don't get back a negative
    // Total 1000 - 1600 - 500 = -1100; effectively available: 1000 - 1600 = -600
    const { maxAmount, maxAmountPerInstrument } = getAmounts({
        cash: 1000,
        trading: -1600,
        bound: -500,
    });
    t.is(maxAmount === 0, true);
    t.is(maxAmountPerInstrument === 0, true);
});


test('works with all negative values', (t) => {
    // trading or bound can be negative – make sure we don't get back a negative
    // Total 1000 - 1600 - 500 = -1100; effectively available: 1000 - 1600 = -600
    const { maxAmount, maxAmountPerInstrument } = getAmounts({
        cash: -1000,
        trading: -1600,
        bound: -500,
    });
    t.is(maxAmount === 0, true);
    t.is(maxAmountPerInstrument === 0, true);
});


