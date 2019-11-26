import test from 'ava';
import {
    createStrategy,
    readCSV,
    talibIndicator,
    convertInstrumentToHighstock,
    exportResult,
} from './main.mjs';

test('creates all exports', (t) => {
    t.is(typeof createStrategy, 'function');
    t.is(typeof readCSV, 'function');
    t.is(typeof talibIndicator, 'function');
    t.is(typeof convertInstrumentToHighstock, 'function');
    t.is(typeof exportResult, 'function');
});
