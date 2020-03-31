/**
 * Creates a CSV file out of multiple performanceReports that were collected by
 * addPerformanceReport
 * @param {object[]} performanceData    Performance data as assembled by addPerformanceReport
 * @return {string}                     CSV of performance reports
 */
export default (performanceData) => {

    // Create column based data first, is much easier; only afterwards convert to row based (CSV)
    // data
    const columnBasedData = performanceData.map(run => ([
        // Sort parameters alphabetically by their name, then add to column
        ...Array.from(run.parameterSet.entries())
            .map(([, value]) => value),
        // Add performance to column
        ...Array.from(run.performance.values()).map(value => value.toFixed(2)),
    ]));

    // Create first row that contains row names
    const [firstPerformance] = performanceData;
    if (firstPerformance) {
        columnBasedData.unshift([
            ...Array.from(firstPerformance.parameterSet.keys()),
            ...Array.from(firstPerformance.performance.keys()),
        ]);
    }

    // Convert column to row based data
    const [firstColumn] = columnBasedData;
    let rowBasedData;
    if (firstColumn) {
        rowBasedData = Array.from(firstColumn.keys()).map(index => (
            columnBasedData.map(column => column[index])
        ));
    }

    return rowBasedData.map(row => row.join(',')).join('\n');

};
