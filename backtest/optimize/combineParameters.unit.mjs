import test from 'ava';
import combineParameters from './combineParameters.mjs';

test('works with empty values', (t) => {
    t.deepEqual(combineParameters(new Map()), [new Map()]);
});

test('combines parameters as expected', (t) => {

    const params = new Map([
        ['slow', [10, 20, 40]],
        ['fast', [5, 7]],
    ]);

    const result = combineParameters(params);

    t.deepEqual(result, [
        new Map([['slow', 10], ['fast', 5]]),
        new Map([['slow', 20], ['fast', 5]]),
        new Map([['slow', 40], ['fast', 5]]),
        new Map([['slow', 10], ['fast', 7]]),
        new Map([['slow', 20], ['fast', 7]]),
        new Map([['slow', 40], ['fast', 7]]),
    ]);

});
