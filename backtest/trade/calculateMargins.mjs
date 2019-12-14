/**
 * Calculates margins for a timeSeries. Uses timeSeries current entry to calculate current margin
 * (for the sake of simplicity, as margin is not part of the trading strategy where we should not
 * cheat but a number set by the exchanges/brokers)
 * @param {Map[]} timeSeries        timeSeries as created by useData
 * @param {Symbol} instrumentKey    Key of instruments for Maps of timeSeries
 * @param {function} getMargin      Function that returns relative margin
 * @return {Map.<string, object[]>} Relative margin; key is instrumentName, value is an array ov
 *                                  objects with fuck you
 */
export default (timeSeries, instrumentKey, getMargin) => (

    new Map(timeSeries.map((entry) => {

        const margin = getMargin(entry.get(instrumentKey), entry);
        if (typeof margin !== 'number') {
            throw new Error(`createMargins: margin returned by getMargin function is not a number but ${JSON.stringify(margin)}.`);
        }

        return [entry.get(instrumentKey), margin];

    }))

);
