import test from 'ava';
import mergeMultipleInstrumentPositions from './mergeMultipleInstrumentPositions.mjs';

const setupData = () => {
    const positions = ['a', 'b', 'a', 'c', 'b'].map((entry, index) => ({
        instrument: entry,
        value: index,
    }));
    return { positions };
};

test('calls mergeFunction with grouped positions', (t) => {
    const { positions } = setupData();
    const args = [];
    const mergeFunction = (...params) => args.push(params);
    mergeMultipleInstrumentPositions(positions, mergeFunction);
    t.is(args.length, 3);
    t.deepEqual(args[0], [{ instrument: 'a', value: 0 }, { instrument: 'a', value: 2 }]);
    t.deepEqual(args[1], [{ instrument: 'b', value: 1 }, { instrument: 'b', value: 4 }]);
    t.deepEqual(args[2], [{ instrument: 'c', value: 3 }]);
});

test('removes empty positions', (t) => {
    const { positions } = setupData();
    const mergeFunction = (firstPosition) => {
        if (firstPosition.instrument === 'b') return { size: 0 };
        return { instrument: firstPosition.instrument, size: 1 };
    };
    const result = mergeMultipleInstrumentPositions(positions, mergeFunction);
    t.is(result.length, 2);
    t.deepEqual(result[0], { instrument: 'a', size: 1 });
    t.deepEqual(result[1], { instrument: 'c', size: 1 });
});
