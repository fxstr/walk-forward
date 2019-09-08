import test from 'ava';
import readFromCSV from './readFromCSV.mjs';

function setupData() {
    const transformFunction = ([key, value]) => [
        key,
        key === 'date' ? new Date(value).getTime() : Number(value),
    ];
    return { transformFunction };
}

test('finds correct files', (t) => {
    const { transformFunction } = setupData();
    const data = readFromCSV('backtest/readFromCSV/test-data/*.csv', transformFunction);
    t.is(data.instruments.size, 1);
    t.is(data.instruments.has('valid'), true);
});

test('accepts and applies transformer', (t) => {
    const { transformFunction } = setupData();
    const data = readFromCSV('backtest/readFromCSV/test-data/*.csv', transformFunction);
    t.deepEqual(
        data,
        {
            instruments: new Map([
                [
                    'valid',
                    {
                        columns: new Map(),
                        data: new Map([
                            [
                                1546297200000,
                                {
                                    selected: false,
                                    weight: 1,
                                    order: undefined,
                                    data: new Map([['open', 4.12], ['close', 4.35]]),
                                },
                            ], [
                                1546383600000,
                                {
                                    selected: false,
                                    weight: 1,
                                    order: undefined,
                                    data: new Map([['open', 4.21], ['close', 4.18]]),
                                },
                            ],
                        ]),
                    },
                ],
            ]),
        },
    );
});
