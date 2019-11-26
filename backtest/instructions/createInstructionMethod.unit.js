import test from 'ava';
import createInstructionMethod from './createInstructionMethod.mjs';
import createTestData from '../testData/createTestData.mjs';
import walkStructure from '../dataHelpers/walkStructure.mjs';

test('throws if instructionFunction is not a function', (t) => {
    const { data } = createTestData();
    t.throws(
        () => createInstructionMethod(data, 'notafunction'),
        /must be a function/,
    );
});

test('throws if length of instructions and timeSeries is different', (t) => {
    const data = {
        timeSeries: [new Map([['date', 2], ['instrument', 'name']])],
        instructions: [{ date: 1, instrument: 'name' }, { date: 2, instrument: 'name' }],
    };
    t.throws(() => createInstructionMethod(data, () => false), /must have the same size/);
});

test('selectFunction is called for every entry', (t) => {
    const { data } = createTestData();
    let calls = 0;
    createInstructionMethod(data, () => calls++ && 1);
    t.is(calls, 8);
});

test('uses correct arguments for selectFunction', (t) => {
    const { data } = createTestData();
    // We cannot check the arguments used at the end as they will be modified while we
    // walk through timeSeries.
    let counter = 0;
    const ts = data.timeSeries;
    createInstructionMethod(data, (...args) => {
        if (counter === 0) {
            t.deepEqual(args, [
                // Jan 1 for aapl
                [ts[0]],
                'aapl',
                // Other instruments don't have any data for jan 1; if there is no data, empty
                // array is returned for that instrument (to simplify access to data, as this
                // reduces the checks we need to make)
                new Map([
                    ['aapl', [ts[0]]],
                    ['amzn', []],
                ]),
            ]);
        }
        if (counter === 3) {
            t.deepEqual(args, [
                [ts[6], ts[2]],
                'amzn',
                new Map([
                    ['aapl', [ts[1], ts[0]]],
                    ['amzn', [ts[6], ts[2]]],
                ]),
            ]);
        }
        counter++;
        return 1;
    });
});

test('does not modify orignal arguments', (t) => {
    const { data } = createTestData();
    const clone = walkStructure(data);
    createInstructionMethod(data, () => -1);
    t.deepEqual(data, clone);
});

test('fails if function returns invalid value', (t) => {
    const { data } = createTestData();
    const validate = (value) => {
        if (value !== true) throw new Error('must be true');
        return value;
    };
    t.throws(() => createInstructionMethod(data, () => false, 'field', validate), /must be true/);
});

test('updates selected on instructions', (t) => {
    const { data } = createTestData();
    // Set selected to 1 on even dates
    const newData = createInstructionMethod(
        data,
        item => (new Date(item[0].get('date')).getDate() % 2 === 0 ? 1 : 0),
        'selected',
    );
    const allSelected = newData.instructions.map(({ selected }) => selected);
    t.deepEqual(allSelected, [0, 1, 1, 0, 1, 1, 1, 0]);
});

test('returns data', (t) => {
    const { data } = createTestData();
    const newData = createInstructionMethod(data, () => -1);
    t.is(Array.isArray(newData.instructions), true);
});