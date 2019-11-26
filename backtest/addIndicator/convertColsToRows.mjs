/**
 * Switches from our column-based data layout to a row-based one:
 * [new Map([[date, instrument, open, low]])] becomes { open: [values] } for every instrument
 * Using for/of loops instead of functional stuff saves us approx. 200 ms/conversion
 * @param  {Map[]} timeSeries         timeSeries as created by useData
 * @param  {Symbol} instrumentKey     Symbol that identifies instrument key in timeSeries
 * @param  {string[]} columnNames     Name of columns that should be converted
 * @return {Map.<string, object.<string, number[]>>}  Map with one entry per instrument that
 *                                    contains an object with key (colName) and value (array of
 *                                    values)
 */
export default (timeSeries, instrumentKey, columnNames) => {

    const returnValue = new Map();
    for (const entry of timeSeries) {
        const instrumentName = entry.get(instrumentKey);
        if (!returnValue.has(instrumentName)) {
            returnValue.set(instrumentName, new Map(columnNames.map(name => [name, []])));
        }
        for (const columnName of columnNames) {
            returnValue.get(instrumentName).get(columnName).push(entry.get(columnName));
        }
    }
    return returnValue;

};
