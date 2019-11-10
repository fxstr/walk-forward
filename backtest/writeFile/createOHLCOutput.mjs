import logger from '../logger/logger.mjs';

const { debug } = logger('WalkForward:createOHLCOutput');

/**
 * Creates output for OHLC.
 * @param  {Map[]} data         Instrument data to be exported
 * @param {string}  name        Name of the instrument the data is exported for
 * @return {Object|undefined}   If OHLC data exsits: Object with keys
 *                              - series : Highstock config for series
 *                              - spareFields: All fields other than the ones used for OHLC
 *                              If OHLC data does not exist, returns undefined
 */
export default function createOHLCOutput(instrumentData, name) {

    // We assume/know that every single time series entry has the same fields; therefore we only
    // look for keys on the first entry
    const allTimeSeriesFields = new Set(instrumentData[0].keys());
    const ohlcFields = ['date', 'open', 'high', 'low', 'close'];
    const hasOHLCFields = ohlcFields.every(field => allTimeSeriesFields.has(field));

    debug('Has all fields for OHLC? %o', hasOHLCFields);
    if (!hasOHLCFields) {
        return { spareFields: allTimeSeriesFields };
    }

    // Create data
    const ohlc = instrumentData.map(entry => ohlcFields.reduce((prev, fieldName) => (
        [...prev, entry.get(fieldName)]
    ), []));
    // Remove o, h, l and c from allTimeSeriesFields
    ohlcFields.slice(1).forEach(fieldName => allTimeSeriesFields.delete(fieldName));

    return {
        series: {
            type: 'ohlc',
            data: ohlc,
            yAxis: 'main',
            name,
        },
        spareFields: allTimeSeriesFields,
    };

}
