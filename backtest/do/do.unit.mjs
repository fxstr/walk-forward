import test from 'ava';
import doFunction from './do.mjs';
import createTestData from '../testData/createTestData.mjs';

test('executes function', (t) => {
    const { data } = createTestData();
    const result = doFunction(data, arg => ({ ...arg, newField: true }));
    t.deepEqual(result, { ...data, newField: true });
});

test('fails on invalid return value', (t) => {
    const { data } = createTestData();
    t.throws(() => doFunction(data, () => false), /must return an object which has/);
});
