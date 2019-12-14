import groupBy from '../dataHelpers/groupBy.mjs';

/**
 * Calculates margins for a timeSeries. Uses timeSeries' previous entry (for a certain instrument)
 * to calculate relative margin of next entry.
 * @param {Map[]} timeSeries        timeSeries as created by useData
 * @param {Symbol} instrumentKey    Key of instruments for Maps of timeSeries
 * @param {function} getMargin      Function that returns relative margin
 * @return {Map.<string, object[]>} Relative margin; key is instrumentName, value is an array ov
 *                                  objects with fuck you
 */
export default (timeSeries, instrumentKey, getMargin) => {

    const timeSeriesGroupedByInstrument = groupBy(timeSeries, item => item.get(instrumentKey));
    const margins = timeSeriesGroupedByInstrument.map(([instrumentName, instrumentData]) => (

        instrumentData.reduce((previous, entry, index) => {

            const previousEntry = previous.slice(-1).pop();

            // Calculate current margin based on previous data (as current indicators are not know
            // on open of the current bar)
            const margin = getMargin(instrumentName, previousEntry.data);
            if (typeof margin !== 'number') {
                throw new Error(`createMargins: margin returned by getMargin function is not a number but ${JSON.stringify(margin)}.`);
            }

            const newValue = {
                data: entry,
                margin: {
                    margin,
                    date: entry.get('date'),
                    instrument: instrumentName,
                },
            };

            if (index === 0) return [newValue];
            else return [...previous, newValue];

        }, [{
            data: new Map(),
        }])

    ));

    // Create array with [0] instrumentName and [1] margin values; can easily be converted
    // to a Map.
    return margins.flat().map(({ margin }) => margin);

};


