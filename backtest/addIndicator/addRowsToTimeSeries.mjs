import groupBy from '../dataHelpers/groupBy.mjs';

/**
 * Merges row-based data (used for indicators) with original data. We do not split this
 * functionality into two parts due to performance improvements with one solution that converts to
 * cols and adds them at the same time.
 */
export default (rowBasedData, originalData, instrumentKey) => {

    // Clone everything at this stage. Data will be updated through groupedByInstrument,
    // but as it contains references to clone, in fact, clone will be updated.
    // This saves us time by not having to re-order all data at the end.
    const clone = originalData.map(entry => (new Map(entry)));

    const groupedByInstrument = new Map(groupBy(
        clone,
        entry => entry.get(instrumentKey),
    ));

    for (const [instrumentName, rowBasedInstrumentData] of rowBasedData) {

        if (!groupedByInstrument.get(instrumentName)) {
            throw new Error(`addRowsToTimeSeries: Row data contains data for instrument ${instrumentName}, but original timeSeries does only contain data for instruments ${Array.from(groupedByInstrument.keys()).join(', ')}.`);
        }

        const timeSeriesForInstrument = groupedByInstrument.get(instrumentName);

        for (const [rowName, values] of rowBasedInstrumentData) {
            if (values.length !== timeSeriesForInstrument.length) {
                throw new Error(`addRowsToTimeSeries: Row based data for row ${rowName} has ${values.length} entries, timeSeries has ${timeSeriesForInstrument.length} entries; they must be the same.`);
            }
            values.forEach((value, index) => {
                // As instrumentData references the original entries of clone, clone will
                // be updated
                timeSeriesForInstrument[index].set(rowName, value);
            });
        }

    }

    return clone;

};

