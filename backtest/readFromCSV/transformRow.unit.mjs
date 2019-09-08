import test from 'ava';
import transformRow from './transformRow.mjs';

test('throws on invalid datd', (t) => {
    t.throws(() => transformRow({ noDate: true }), /field 'date'/);
    t.throws(() => transformRow({ date: 'not-a-number' }), /field 'date'/);
});

test('transforms data', (t) => {
    const data = transformRow({ date: 1567349676343, open: 4.12, close: 4.24 });
    t.deepEqual(data, [
        1567349676343,
        {
            selected: false,
            weight: 1,
            order: undefined,
            data: new Map([['open', 4.12], ['close', 4.24]]),
        },
    ]);
});

test('applies transformerFunction', (t) => {
    const transformerFunction = ([key, value]) => [
        key,
        key === 'date' ? new Date(value).getTime() : Number(value),
    ];
    const data = { date: '2019-01-01 00:00:00', open: '4.12', close: '4.24' };
    const transformedData = transformRow(data, transformerFunction);
    t.deepEqual(transformedData, [
        1546297200000,
        {
            selected: false,
            weight: 1,
            order: undefined,
            data: new Map([['open', 4.12], ['close', 4.24]]),
        },
    ]);
});
