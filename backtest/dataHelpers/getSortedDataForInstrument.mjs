/**
 * Filters timeSeries by all entries for a certain instruments and sorts data chronologically
 */
export default function getSortedDataForInstrument(data, instrument) {

    return data.timeSeries
        // Get all timeSeries data that belongs to current instrument
        .filter(entry => entry.get(data.instrumentKey) === instrument)
        // Sort chronologically
        .sort((a, b) => a.get('date') - b.get('date'));

}
