import test from 'ava';
import * as walkForward from './main.mjs';

test('creates all exports', (t) => {
    [
        'createBacktest',
        'readCSV',
        'talibIndicator',
        'convertInstrumentToHighstock',
        'exportResult',
        'exportPerformance',
    ].forEach(exportedFunction => t.is(typeof walkForward[exportedFunction], 'function'));
});
