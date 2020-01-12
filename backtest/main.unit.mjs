import test from 'ava';
import {
    createStrategy,
    readCSV,
    talibIndicator,
    convertInstrumentToHighstock,
    exportResult,
    exportPerformance,
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
        exportPerformance,
        groupBy,
        addRowsToTimeSeries,
    ].forEach(exportedFunction => t.is(typeof exportedFunction, 'function'));
});
