import test from 'ava';
import addPerformanceReport from './addPerformanceReport.mjs';
import getPerformanceReportCSV from './getPerformanceReportCSV.mjs';

test('returns performance report CSV', (t) => {

    let data = addPerformanceReport(
        { performance: new Map([['row1', 1], ['row2', 2]]) },
        // Use alphabetically unsorted data
        new Map([['param1', 1], ['param2', 2]]),
    );
    data = addPerformanceReport(
        { performance: new Map([['row1', 2], ['row2', 4]]) },
        new Map([['param1', 3], ['param2', 5]]),
        data,
    );

    const csv = getPerformanceReportCSV(data);

    t.is(csv, 'param1,1,3\nparam2,2,5\nrow1,1.00,2.00\nrow2,2.00,4.00');

});
