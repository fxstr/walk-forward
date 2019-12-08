import test from 'ava';
import getTradableAmount from './getTradableAmount.mjs';

const setupData = () => {
    const positionValues = new Map([
        ['aapl', 180],
        ['amzn', 20],
    ]);
    const instructions = [{
        instrument: 'aapl',
    }, {
        instrument: 'amzn',
    }];
    return { positionValues, instructions };
};

test('returns expected value', (t) => {
    const { positionValues, instructions } = setupData();
    const result = getTradableAmount(instructions, positionValues);
    t.is(result, 200);
});

test('returns works with missing positionValues', (t) => {
    const { positionValues, instructions } = setupData();
    positionValues.delete('aapl');
    const result = getTradableAmount(instructions, positionValues);
    t.is(result, 20);
});

