import test from 'ava';
import createOHLCOutput from './createOHLCOutput.mjs';

test('returns only spare data if OHLC is not available', (t) => {
    const data = [new Map([
        ['open', 3],
        ['other', 2],
    ])];
    t.deepEqual(createOHLCOutput(data), {
        spareFields: new Set(['open', 'other']),
    });
});

test('returns series and data if ohlc is given', (t) => {
    const data = [
        new Map([
            ['date', 12345],
            ['open', 1],
            ['high', 2],
            ['low', 3],
            ['close', 4],
            ['other', 5],
            ['last', 6],
        ]),
        new Map([
            ['date', 12346],
            ['open', 2],
            ['high', 3],
            ['low', 4],
            ['close', 5],
            ['other', 6],
            ['last', 7],
        ]),
    ];

    const result = createOHLCOutput(data);
    t.deepEqual(result, {
        series: {
            data: [
                [12345, 1, 2, 3, 4],
                [12346, 2, 3, 4, 5],
            ],
            yAxis: 'main',
            type: 'ohlc',
        },
        spareFields: new Set(['date', 'other', 'last']),
    });

});
