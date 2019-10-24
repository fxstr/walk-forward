/**
 * Converts talib data back to data that is expected by addIndicator()
 * @param {Object} talibData            Data returned by talib, e.g. { talibKey: [5, 3, 4] }
 * @param {Number[]} sortedDates        Chronologically sorted array of dates for the instrument
 *                                      we created the indicator for.
 * @param {String} instrumentName       Name of current instrument
 * @param {Object} outputOptions        Mapping for output:
 *                                      - key: talibName
 *                                      - value: name in new column
 * @return {Map[]}                      Array of Maps, each Map with fields
 *                                      - 'instrument'
 *                                      - 'date'
 *                                      - (field names passed in, 1 per indicator)
 */
export default function createDataFromTalib(
    talibData,
    sortedDates,
    instrumentName,
    outputMapping,
) {

    // Create array of Maps, each with a date and instrument field
    const returnValue = sortedDates.map(date => new Map([
        ['date', date],
        ['instrument', instrumentName],
    ]));

    // Add every row of talib data to returnValue; indexes of returnValue and values from talib
    // will be identical (both sorted chronologically).
    Object.entries(talibData).forEach(([talibColumnName, values]) => {
        values.forEach((value, valueIndex) => {
            returnValue[valueIndex].set(outputMapping[talibColumnName], value);
        });
    });

    return returnValue;

}
