import test from 'ava';
import * as walkForward from './main.mjs';

test('creates all exports', (t) => {
    [
        'createStrategy',
        'readCSV',
        'talibIndicator',
        'convertInstrumentToHighstock',
        'exportResult',
        'exportPerformance',
        'groupBy',
        'rSquared',
    ].forEach(exportedFunction => t.is(typeof walkForward[exportedFunction], 'function'));
});
