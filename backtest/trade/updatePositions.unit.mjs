import test from 'ava';
import updatePositions from './updatePositions.mjs';
import createPosition from './createPosition.mjs';
import updatePosition from './updatePosition.mjs';


const setupData = () => {
    const positions = [createPosition('a', 10, 5), createPosition('b', 10, 4)];
    const args = [];
    const updateFunction = (...params) => args.push(params);
    const prices = new Map([['a', 6], ['b', 3]]);
    const pointValues = new Map([['a', 1], ['b', 1.2]]);
    return {
        positions,
        args,
        updateFunction,
        prices,
        pointValues,
    };
};


test('calls function with expected parameters', (t) => {
    const {
        positions,
        args,
        updateFunction,
        prices,
        pointValues,
    } = setupData();
    updatePositions(
        positions,
        updateFunction,
        false,
        prices,
        pointValues,
    );
    t.is(args.length, 2);
    t.deepEqual(args[0], [positions[0], false, 6, 1]);
    t.deepEqual(args[1], [positions[1], false, 3, 1.2]);
});


test('returns updated positions', (t) => {
    const {
        positions,
        prices,
        pointValues,
    } = setupData();
    const updateFunction = (position, isClosing, price) => ({
        instrument: position.instrument,
        newPrice: price,
    });
    const result = updatePositions(
        positions,
        updateFunction,
        false,
        prices,
        pointValues,
    );
    t.is(result.length, 2);
    t.deepEqual(result[0], { instrument: 'a', newPrice: 6 });
    t.deepEqual(result[1], { instrument: 'b', newPrice: 3 });
});


test('works with updatePosition', (t) => {
    const {
        positions,
        prices,
        pointValues,
    } = setupData();
    const result = updatePositions(
        positions,
        updatePosition,
        false,
        prices,
        pointValues,
    );
    t.is(result.length, 2);
    // Test second position as it has a pointValue other than 1
    const expectation = updatePosition(positions[1], false, 3, 1.2);
    t.deepEqual(result[1], expectation);
});



