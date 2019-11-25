/**
 * Creates data that can be used for talib
 * @param  {object[]} data     Data as created by useData, but only for current instrument, sorted
 *                             by date
 * @param  {object} inputs     Object that maps current column names with names for talib:
 *                             - key: property name for talib
 *                             - value: name of key in original data
 * @return {object}            Data to be used in talib, e.g.
 *                             {
 *                                 talibKey1: [1.2, 2.1, 1.7],
 *                                 talibKey2: [1.4, 1.3, 1.9]
 *                             }
 */
export default function createDataForTalib(dataForInstrument, inputs) {

    const result = {};
    Object.entries(inputs).forEach(([talibName, originalName]) => {
        result[talibName] = dataForInstrument.map(item => item.get(originalName));
    });

    return result;

}
