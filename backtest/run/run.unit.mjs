import test from 'ava';
import run from './run.mjs';

test('data defaults to an empty Map', async(t) => {
    let firstData;
    const stack = [[(data) => { firstData = data; }]];
    const runnerFunction = run(stack);
    await runnerFunction();
    t.deepEqual(firstData, new Map());
});

test('runs stack async, returns correct result', async(t) => {
    const stack = [
        [(data, param) => param, 1],
        // Test async function in stack
        [
            (data, param1, param2) => new Promise(resolve => setTimeout(() => (
                resolve(data + param1 + param2)
            ))),
            2,
            3,
        ],
    ];
    const result = await run(stack)();
    t.is(result, 6);
});

test('throws correctly', async(t) => {
    const stack = [
        [() => true],
        [() => new Promise((resolve, reject) => { setTimeout(reject(new Error('testError'))); })],
        [() => true],
    ];
    await t.throwsAsync(() => run(stack)(), /testError/);
});
