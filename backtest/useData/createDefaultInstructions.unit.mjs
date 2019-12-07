import test from 'ava';
import createDefaultInstructions from './createDefaultInstructions.mjs';

test('creates correct instructions', (t) => {
    const result = createDefaultInstructions('testInstrument', 1234);
    t.deepEqual(result, {
        date: 1234,
        instrument: 'testInstrument',
        selected: 0,
        weight: 1,
        rebalance: true,
    });
});
