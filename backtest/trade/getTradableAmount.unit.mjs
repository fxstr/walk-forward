import test from 'ava';
import getTradableAmount from './getTradableAmount.mjs';

const setupData = () => {
    const positions = [{
        instrument: 'aapl',
        value: 180,
    }, {
        instrument: 'amzn',
        value: 20,
    }];
    const instructions = [{
        instrument: 'aapl',
    }, {
        instrument: 'amzn',
    }];
    return { positions, instructions };
};

test('returns expected value', (t) => {
    const { positions, instructions } = setupData();
    const result = getTradableAmount(instructions, positions);
    t.is(result, 200);
});

test('returns works with missing positionValues', (t) => {
    const { positions, instructions } = setupData();
    const amznPosition = positions.slice(1, 2);
    const result = getTradableAmount(instructions, amznPosition);
    t.is(result, 20);
});

