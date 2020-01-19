import convertColsToRows from '../addIndicator/convertColsToRows.mjs';
import addRowsToTimeSeries from '../addIndicator/addRowsToTimeSeries.mjs';

/**
 * Allows us to easily create new indicators as it provides all scaffolding necessary to easily do
 * row-based calculations:
 * - Converts timeSeries to a row-based layout
 * - Renames rows according to options provided
 * - Calls a function for every instrument data
 * - Renames rows according to options provided
 * - Merges data returned by function together with timeSeries data
 *
 * Regular column based timeSeries consists of entries:
 * new Map([['date', 124], [instrumentKey, 'aapl'], ['open': 5]])
 * Row-based data looks like:
 * new Map([['instrument', new Map([['open', [5]]])]])
 *
 * @param {Map[]} timeSeries           TimeSeries, see useData
 * @param {object} option              Options with properties: inputs and outputs …
 * @param {function} callback          Callback function to call for every instrument with renamed
 *                                     rows.
 */
export default (data, options, callback) => {

    const { timeSeries, instrumentKey } = data;
    if (!options || typeof options !== 'object' || !(options instanceof Object)) {
        throw new Error(`walkSeries: Argument options must be an object, is ${JSON.stringify(options)} instead.`);
    }
    if (!options.inputs || !(options.inputs instanceof Map)) {
        throw new Error(`walkSeries: inputs property of options argument must be a Map, is ${JSON.stringify(options.inputs)} instead.`);
    }
    if (!options.outputs || !(options.outputs instanceof Map)) {
        throw new Error(`walkSeries: outputs property of options argument must be a Map, is ${JSON.stringify(options.outputs)} instead.`);
    }
    if (typeof callback !== 'function') {
        throw new Error(`walkSeries: Argument callback must be a function, is ${typeof callback} instead.`);
    }

    // Convert to row-based layout
    const rowBasedData = convertColsToRows(
        timeSeries,
        instrumentKey,
        Array.from(options.inputs.keys()),
    );

    // Go through instruments
    const newTimeSeries = Array
        .from(rowBasedData.entries())
        .map(([instrumentName, instrumentData]) => {

            // Rename rows to values provided in options.inputs
            const renamedInstrumentData = new Map(Array.from(instrumentData.entries())
                .map(([name, rowData]) => [
                    options.inputs.get(name),
                    rowData,
                ]));

            // Should we add args to callback? (instrumentData, index, allData)
            const result = callback(renamedInstrumentData);

            // Check result
            // Length of value array is tested by addRowsToTimeSeries
            if (!(result instanceof Map)) {
                throw new Error(`walkSeries: Expected callback function to return map, returned ${JSON.stringify(result)} instead.`);
            }

            // Rename rows to values provided in options.outputs
            const renamedResult = new Map(Array.from(result.entries()).map(([name, rowData]) => [
                options.outputs.get(name),
                rowData,
            ]));

            return [instrumentName, renamedResult];

        });

    // Merge old and new rows
    const mergedTimeSeries = addRowsToTimeSeries(
        newTimeSeries,
        data.timeSeries,
        data.instrumentKey,
    );

    return {
        ...data,
        timeSeries: mergedTimeSeries,
    };

};
