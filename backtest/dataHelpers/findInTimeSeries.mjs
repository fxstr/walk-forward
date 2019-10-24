/**
 * Returns the first item in data.timeSeries that matches instrumentName and date
 * @param  {Object} data             Data as created by useData()
 * @param  {String} instrumentName   Name of instrument to look for
 * @param  {Number} date             Date to look for
 * @return {Object?}                 Matching entry of data.timeSeries or undefined
 */
export default function findInTimeSeries(data, instrumentName, date) {
    return data.timeSeries
        .find(entry =>
            entry.get('date') === date && entry.get(data.instrumentKey) === instrumentName);
}
