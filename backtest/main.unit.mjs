import test from 'ava';
import {
    createStrategy,
    readCSV,
    talibIndicator,
    convertInstrumentToHighstock,
    exportResult,
    groupBy,
    addRowsToTimeSeries,
} from './main.mjs';

test('creates all exports', (t) => {
    [
        createStrategy,
        readCSV,
        talibIndicator,
        convertInstrumentToHighstock,
        exportResult,
        groupBy,
        addRowsToTimeSeries,
    ].forEach(exportedFunction => t.is(typeof exportedFunction, 'function'));
});
