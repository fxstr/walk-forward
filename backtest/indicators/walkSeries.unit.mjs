import test from 'ava';
import walkSeries from './walkSeries.mjs';
import createTestData from '../testData/createTestData.mjs';
import walkStructure from '../dataHelpers/walkStructure.mjs';

test('validates arguments', (t) => {
    t.throws(() => walkSeries({}), /options must be an object/);
    t.throws(() => walkSeries({}, () => {}), /options must be an object/);
    t.throws(() => walkSeries({}, { inputs: {} }), /inputs property of options argument/);
    t.throws(
        () => walkSeries({}, { inputs: new Map() }),
        /outputs property of options argument/,
    );
    t.throws(
        () => walkSeries({}, { inputs: new Map(), outputs: new Map() }),
        /Argument callback must be a function/,
    );
    t.notThrows(() => walkSeries(
        { timeSeries: [] },
        { inputs: new Map(), outputs: new Map() },
        () => {},
    ));
});


test('calls callback for every instrument with corect arguments', (t) => {
    const { data, instrumentKey } = createTestData();
    const calls = [];
    const callback = (...params) => {
        calls.push(params);
        return params[0];
    };
    walkSeries(
        data,
        { inputs: new Map([['open', 'in1'], ['close', 'in2']]), outputs: new Map() },
        callback,
    );
    t.is(calls.length, 2);

    const getEntries = (instrument, row) => data.timeSeries
        .filter(item => item.get(instrumentKey) === instrument).map(item => item.get(row));
    t.deepEqual(calls[0][0], new Map([
        ['in1', getEntries('aapl', 'open')],
        ['in2', getEntries('aapl', 'close')],
    ]));
    t.deepEqual(calls[1][0], new Map([
        ['in1', getEntries('amzn', 'open')],
        ['in2', getEntries('amzn', 'close')],
    ]));
});


test('returns data with updated timeSeries', (t) => {
    const { data } = createTestData();
    const newData = walkSeries(
        data,
        {
            inputs: new Map([['open', 'in1'], ['close', 'in2']]),
            outputs: new Map([['out1', 'openPlus'], ['out2', 'closeMinus']]),
        },
        // Add 1 to all 'open' data, remove 1 from all 'close' data
        instrumentData => new Map([
            ['out1', instrumentData.get('in1').map(entry => entry + 1)],
            ['out2', instrumentData.get('in2').map(entry => entry - 1)],
        ]),
    );

    t.deepEqual(newData.timeSeries, data.timeSeries.map((entry) => {
        const clone = new Map(entry);
        clone.set('openPlus', clone.get('open') + 1);
        clone.set('closeMinus', clone.get('close') - 1);
        return clone;
    }));
});

test('does not modify fields other than timeSeries', (t) => {
    const { data } = createTestData();
    const originalData = walkStructure(data);
    walkSeries(
        data,
        {
            inputs: new Map([['open', 'in']]),
            outputs: new Map([['out', 'newField']]),
        },
        // Add 1 to all 'open' data
        instrumentData => new Map([['out', instrumentData.get('in').map(entry => entry + 1)]]),
    );
    t.deepEqual(data, originalData);
});

test('validates return value of callback', (t) => {
    const { data } = createTestData();
    const options = {
        inputs: new Map([['close', 'in']]),
        outputs: new Map([['out', 'newField']]),
    };
    t.throws(
        () => walkSeries(data, options, () => {}),
        /function to return map/,
    );
});

