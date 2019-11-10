import test from 'ava';
import run from './run.mjs';

test('data defaults to an empty Map', async(t) => {
    let firstData;
    const stack = [[(data) => {
        firstData = data;
    }]];
    await run(stack, 10);
    t.deepEqual(firstData, new Map());
});

