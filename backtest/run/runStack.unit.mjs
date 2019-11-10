import test from 'ava';
import runStack from './runStack.mjs';

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
    const result = await runStack(stack, new Map());
    t.is(result, 6);
});

test('throws correctly', async(t) => {
    const stack = [
        [() => true],
        [() => new Promise((resolve, reject) => {
            setTimeout(reject(new Error('testError')));
        })],
        [() => true],
    ];
    await t.throwsAsync(() => runStack(stack, new Map()), /testError/);
});
