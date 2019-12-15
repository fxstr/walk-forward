import test from 'ava';
import readCSV from './readCSV.mjs';

function setupData() {
    const transformFunction = ([key, value]) => [
        key,
        key === 'date' ? new Date(value).getTime() : Number(value),
    ];
    return { transformFunction };
}

test('reads correct files', (t) => {
    const data = readCSV('backtest/readCSV/testData/*.csv');
    t.is(data.size, 1);
    t.is(data.has('valid'), true);
});

test('returns correct data (without transformFunction)', (t) => {
    const data = readCSV('backtest/readCSV/testData/*.csv');
    t.deepEqual(data, new Map([[
        'valid', [new Map([
            ['date', '2019-01-01 00:00:00'],
            ['open', '4.12'],
            ['close', '4.35'],
        ]), new Map([
            ['date', '2019-01-02 00:00:00'],
            ['open', '4.21'],
            ['close', '4.18'],
        ])],
    ]]));
});

test('applies column transformFunction', (t) => {
    const { transformFunction } = setupData();
    const data = readCSV('backtest/readCSV/testData/*.csv', transformFunction);
    t.deepEqual(data, new Map([[
        'valid', [new Map([
            ['date', 1546297200000],
            ['open', 4.12],
            ['close', 4.35],
        ]), new Map([
            ['date', 1546383600000],
            ['open', 4.21],
            ['close', 4.18],
        ])],
    ]]));
});


test('applies fileName transformFunction', (t) => {
    const data = readCSV(
        'backtest/readCSV/testData/*.csv',
        undefined,
        fileName => `${fileName}-newName`,
    );
    t.deepEqual(Array.from(data.keys()), ['valid-newName']);
});

