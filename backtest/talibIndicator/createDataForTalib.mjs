import getSortedDataForInstrument from '../dataHelpers/getSortedDataForInstrument.mjs';

/**
 * Creates data that can be used for talib
 * @param  {Object} data       Data as created by useData
 * @param  {String} instrument Instrument we need to convert data for
 * @param  {Object} inputs     Object that maps current column names with names for talib:
 *                             - key: property name for talib
 *                             - value: name of key in original data
 * @return {Object}            Data to be used in talib, e.g.
 *                             {
 *                                 talibKey1: [1.2, 2.1, 1.7],
 *                                 talibKey2: [1.4, 1.3, 1.9]
 *                             }
 */
export default function createDataForTalib(data, instrument, inputs) {

    const timeSeriesForInstrument = getSortedDataForInstrument(data, instrument);

    return Object.entries(inputs).reduce((prev, [talibName, originalName]) => (
        {
            ...prev,
            [talibName]: timeSeriesForInstrument.map(item => item.get(originalName)),
        }
    ), {});

}
