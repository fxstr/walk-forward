import test from 'ava';
import createHighstockSeries from './createHighstockSeries.mjs';

test('handles data without view options', (t) => {
    const data = [
        new Map([
            ['date', 123],
            ['test', 1],
            ['other', 3],
        ]),
        new Map([
            ['date', 124],
            ['test', 2],
            ['other', 4],
        ]),
    ];
    const result = createHighstockSeries(data, new Set(['test', 'other']));
    t.deepEqual(result, [{
        type: 'line',
        yAxis: 'main',
        name: 'test',
        data: [[123, 1], [124, 2]],
    }, {
        type: 'line',
        yAxis: 'main',
        name: 'other',
        data: [[123, 3], [124, 4]],
    }]);
});

test('ignores fields not in fields', (t) => {
    const data = [
        new Map([
            ['date', 123],
            ['test', 1],
            // open field should be ignored, is not in fields
            ['open', 2],
        ]),
    ];
    const result = createHighstockSeries(data, new Set(['test']));
    t.deepEqual(result, [{
        type: 'line',
        yAxis: 'main',
        name: 'test',
        data: [[123, 1]],
    }]);
});


test('handles data with view options', (t) => {
    const data = [
        new Map([
            ['date', 123],
            ['test', 1],
        ]),
        new Map([
            ['date', 124],
            ['test', 2],
        ]),
    ];
    const result = createHighstockSeries(
        data,
        new Set(['test']),
        new Map([[
            'test',
            {
                type: 'area',
                panel: 'panelName',
            },
        ]]),
    );
    t.deepEqual(result, [{
        type: 'area',
        yAxis: 'panelName',
        name: 'test',
        data: [[123, 1], [124, 2]],
    }]);
});


test('does not export if panel is false', (t) => {
    const data = [
        new Map([
            ['date', 123],
            ['test', 1],
        ]),
    ];
    const result = createHighstockSeries(
        data,
        new Set(['test']),
        new Map([['test', { panel: false }]]),
    );
    t.deepEqual(result, []);
});
