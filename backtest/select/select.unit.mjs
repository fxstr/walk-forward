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
    select(() => calls++ && 1)(data);
    t.is(calls, 8);
});

test('uses correct arguments for selectFunction', (t) => {
    const { data } = createTestData();
    const usedArguments = [];
    select((...args) => usedArguments.push(args) && 1)(data);
    t.deepEqual(usedArguments[0], [
        data.timeSeries[0],
        'aapl',
        new Map([['aapl', [data.timeSeries[0]]]]),
    ]);
    const ts = data.timeSeries;
    t.deepEqual(usedArguments[7], [
        ts[4],
        'aapl',
        new Map([
            ['aapl', [ts[4], ts[5], ts[3], ts[1], ts[0]]],
            ['amzn', [ts[7], ts[6], ts[2]]],
        ]),
    ]);
});

test('does not modify orignal arguments', (t) => {
    const { data } = createTestData();
    const clone = walkStructure(data);
    select(() => -1)(data);
    t.deepEqual(data, clone);
});

test('fails if function returns invalid value', (t) => {
    const { data } = createTestData();
    t.throws(() => select(() => true)(data), /must be -1, 0 or 1/);
});

test('updates selected on instructions', (t) => {
    const { data } = createTestData();
    // Set selected true on even dates
    const newData = select(item => (new Date(item.get('date')).getDate() % 2 === 0 ? 1 : 0))(data);
    const allSelected = newData.instructions.map(({ selected }) => selected);
    t.deepEqual(allSelected, [0, 1, 1, 0, 1, 1, 1, 0]);
});

test('returns data', (t) => {
    const { data } = createTestData();
    const newData = select(() => -1)(data);
    t.is(Array.isArray(newData.instructions), true);
});
