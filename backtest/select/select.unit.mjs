import test from 'ava';
import select from './select.mjs';
import createTestData from '../testData/createTestData.mjs';
import walkStructure from '../dataHelpers/walkStructure.mjs';

test('throws if length of instructions and timeSeries is different', (t) => {
    const data = {
        timeSeries: [new Map([['date', 2], ['instrument', 'name']])],
        instructions: [{ date: 1, instrument: 'name' }, { date: 2, instrument: 'name' }],
    };
    t.throws(() => select(() => false)(data), /must have the same size/);
});

test('selectFunction is called for every entry', (t) => {
    const { data } = createTestData();
    let calls = 0;
    select(() => calls++)(data);
    t.is(calls, 8);
});

test('uses correct arguments for selectFunction', (t) => {
    const { data } = createTestData();
    const usedArguments = [];
    select((...args) => usedArguments.push(args))(data);
    t.deepEqual(usedArguments[0], [
        data.timeSeries[0],
        [],
        new Map(),
    ]);
    t.deepEqual(usedArguments[7], [
        data.timeSeries[4],
        [data.timeSeries[0], data.timeSeries[1], data.timeSeries[3], data.timeSeries[5]],
        new Map([
            ['amzn', [data.timeSeries[2], data.timeSeries[6], data.timeSeries[7]]],
        ]),
    ]);
});

test('does not modify orignal arguments', (t) => {
    const { data } = createTestData();
    const clone = walkStructure(data);
    select(() => false)(data);
    t.deepEqual(data, clone);
});

test('updates selected on instructions', (t) => {
    const { data } = createTestData();
    // Set selected true on even dates
    const newData = select(item => new Date(item.get('date')).getDate() % 2 === 0)(data);
    const allSelected = newData.instructions.map(({ selected }) => selected);
    t.deepEqual(allSelected, [false, true, true, false, true, true, true, false]);
});

test('returns data', (t) => {
    const { data } = createTestData();
    const newData = select(() => false)(data);
    t.is(Array.isArray(newData.instructions), true);
});
