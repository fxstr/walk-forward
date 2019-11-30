import test from 'ava';
import runInstructions from './runInstructions.mjs';
import createTestData from '../testData/createTestData.mjs';
import walkStructure from '../dataHelpers/walkStructure.mjs';



test('selectFunction is called for every entry', (t) => {
    const { data } = createTestData();
    let calls = 0;
    const instructionData = [{
        instructionFunction: () => calls++,
        instructionField: 'field',
        validate: value => value,
    }];
    runInstructions(
        instructionData,
        // timeSeries entries must be from the same date
        [data.timeSeries[1], data.timeSeries[2]],
        data.instrumentKey,
        new Map(),
    );
    t.is(calls, 2);
});

test('works without instruction functions', (t) => {
    const { data } = createTestData();
    const instructionData = [];
    const result = runInstructions(
        instructionData,
        // timeSeries entries must be from the same date
        [data.timeSeries[1], data.timeSeries[2]],
        data.instrumentKey,
        new Map(),
    );
    t.deepEqual(result, {
        instructions: [
            { instrument: 'aapl', date: data.timeSeries[1].get('date') },
            { instrument: 'amzn', date: data.timeSeries[2].get('date') },
        ],
        instructionFunctionArguments: new Map([
            ['aapl', [data.timeSeries[1]]],
            ['amzn', [data.timeSeries[2]]],
        ]),
    });
});

test('uses correct arguments for instruction function', (t) => {
    const { data } = createTestData();
    // We cannot check the arguments used at the end as they will be modified while we
    // walk through timeSeries.
    let counter = 0;
    const ts = data.timeSeries;
    const instructionData = [{
        instructionFunction: (...args) => {
            if (counter === 0) {
                // Jan 1 for aapl
                t.deepEqual(args, [
                    [ts[1]],
                    'aapl',
                    // Other instruments don't have any data for jan 1; if there is no data, empty
                    // array is returned for that instrument (to simplify access to data, as this
                    // reduces the checks we need to make)
                    new Map([
                        ['aapl', [ts[1]]],
                        ['amzn', [ts[2]]],
                    ]),
                ]);
            }
            if (counter === 1) {
                t.deepEqual(args, [
                    [ts[2]],
                    'amzn',
                    new Map([
                        ['aapl', [ts[1]]],
                        ['amzn', [ts[2]]],
                    ]),
                ]);
            }
            counter++;
        },
        instructionField: 'field',
        validate: value => value,
    }];

    runInstructions(
        instructionData,
        // timeSeries entries must be from the same date
        [data.timeSeries[1], data.timeSeries[2]],
        data.instrumentKey,
        new Map(),
    );
});




test('updates instructions and arguments', (t) => {
    const { data } = createTestData();
    const instructionData = [{
        instructionFunction: instrumentData => (
            new Date(instrumentData[0].get('date')).getDate() % 2 === 0 ? -1 : 1
        ),
        instructionField: 'field',
        validate: value => value,
    }];

    const { instructions, instructionFunctionArguments } = runInstructions(
        instructionData,
        // timeSeries entries must be from the same date
        [data.timeSeries[1], data.timeSeries[2]],
        data.instrumentKey,
        new Map(),
    );

    t.deepEqual(instructions, [{
        instrument: 'aapl',
        date: data.timeSeries[1].get('date'),
        field: -1,
    }, {
        instrument: 'amzn',
        date: data.timeSeries[2].get('date'),
        field: -1,
    }]);

    t.deepEqual(instructionFunctionArguments, new Map([
        ['aapl', [data.timeSeries[1]]],
        ['amzn', [data.timeSeries[2]]],
    ]));

    // Check if multiple calls can be chained
    const result2 = runInstructions(
        instructionData,
        [data.timeSeries[3]],
        data.instrumentKey,
        instructionFunctionArguments,
    );

    t.deepEqual(result2.instructions, [{
        instrument: 'amzn',
        date: data.timeSeries[3].get('date'),
        field: 1,
    }]);

    t.deepEqual(result2.instructionFunctionArguments, new Map([
        ['aapl', [data.timeSeries[1]]],
        ['amzn', [data.timeSeries[3], data.timeSeries[2]]],
    ]));


});




test('works with multiple instruction functions', (t) => {
    const { data } = createTestData();
    const instructionData = [{
        instructionFunction: instrumentData => (
            new Date(instrumentData[0].get('date')).getDate() % 2 === 0 ? -1 : 1
        ),
        instructionField: 'field1',
        validate: value => value,
    }, {
        instructionFunction: instrumentData => (
            instrumentData[0].get(data.instrumentKey) === 'aapl' ? 5 : -5
        ),
        instructionField: 'field2',
        validate: value => value,
    }];

    const { instructions } = runInstructions(
        instructionData,
        // timeSeries entries must be from the same date
        [data.timeSeries[1], data.timeSeries[2]],
        data.instrumentKey,
        new Map(),
    );

    t.deepEqual(instructions, [{
        instrument: 'aapl',
        date: data.timeSeries[1].get('date'),
        field1: -1,
        field2: 5,
    }, {
        instrument: 'amzn',
        date: data.timeSeries[2].get('date'),
        field1: -1,
        field2: -5,
    }]);

});



test('fails if function returns invalid value', (t) => {
    const { data } = createTestData();
    const instructionData = [{
        instructionFunction: () => true,
        instructionField: 'field',
        validate: (value) => {
            if (value !== -1) throw new Error('notMinusOneError');
            return value;
        },
    }];

    t.throws(() => runInstructions(
        instructionData,
        [data.timeSeries[3]],
        data.instrumentKey,
        new Map(),
    ), /notMinusOneError/);
});

test.skip('does not modify original data', (t) => {
    t.pass();
});

