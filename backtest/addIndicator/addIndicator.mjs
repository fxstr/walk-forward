import { performance } from 'perf_hooks';
import logger from '../logger/logger.mjs';
// import walkStructure from '../dataHelpers/walkStructure.mjs';
import spinner from '../spinner/spinner.mjs';
import groupBy from '../dataHelpers/groupBy.mjs';
import sortBy from '../dataHelpers/sortBy.mjs';

const { debug } = logger('WalkForward:addIndicator');

/**
 * Adds an indicator to data
 * @param  {Object} data                Data structure as created by useData()
 * @param  {Function} indicatorFunction Function that will be called to create the indicators
 * @return {Object}                     Cloned data enriched with new indicator data
 */
export default async(data, indicatorFunction) => {

    // TODO:
    // Create data in the form of Map{columnName: [val1, val2]} and pass it to the indicatorFunction
    // Handle output in the same form from the indicatorFunction
    // Should speed up (fewer transformations) and simplify things

    const output = spinner('Adding indicator …');

    const startTime = performance.now();
    const indicatorData = await indicatorFunction(data);
    const indicatorTime = performance.now();

    // Check data
    indicatorData.forEach((indicatorEntry) => {
        if (!indicatorEntry.has('date')) {
            throw new Error(`addIndicator: Indicator function did return an entry without a date: ${JSON.stringify(Array.from(indicatorEntry.entries()))}.`);
        }
        if (!indicatorEntry.has('instrument')) {
            throw new Error(`addIndicator: Indicator function did return an entry without an instrument: ${JSON.stringify(Array.from(indicatorEntry.entries()))}.`);
        }
    });

    // Get a meaningful data structure to reduce lookups on this.data.timeSeries when adding
    // indicator data
    const groupedIndicatorData = new Map(groupBy(
        indicatorData,
        entry => entry.get('instrument'),
    ));

    const groupedData = new Map(groupBy(
        data.timeSeries,
        entry => entry.get(data.instrumentKey),
    ));

    const mergedData = Array.from(groupedData.entries())

        // Create intermediary array with two entries: data and indicatorData (both for a certain
        // instrument)
        .map(([instrumentName, instrumentData]) => {
            const indicatorDataForInstrument = groupedIndicatorData.get(instrumentName);
            if (instrumentData.length !== indicatorDataForInstrument.length) {
                throw new Error(`addIndicator: Length of data returned by indicator (${indicatorDataForInstrument.length}) must correspond to the length of the original timeSeries (${instrumentData.length}).`);
            }
            return [instrumentData, indicatorDataForInstrument];
        })

        // Remove instrument property from indicatorData
        .map(([instrumentData, indicatorDataForInstrument]) => [
            instrumentData,
            indicatorDataForInstrument.map((entry) => {
                const clone = new Map(entry);
                clone.delete('instrument');
                return clone;
            }),
        ])

        // Merge data and indicatorData
        .map(([instrumentData, indicatorDataForInstrument]) => (
            instrumentData.map((entry, index) => {
                const indicator = indicatorDataForInstrument[index];
                if (entry.get('date') !== indicator.get('date')) {
                    throw new Error(`addIndicator: Date for timeSeries and indicator data at same position is not the same: ${entry.get('date')} vs. ${indicator.get('date')}.`);
                }
                return new Map([
                    ...entry,
                    ...indicator,
                ]);
            })
        ))

        // Merge data of all instruments into one array
        .reduce((prev, instrumentData) => [...prev, ...instrumentData], [])
        // TODO: Remove when addIndicator was re-implemented
        .sort(sortBy('date', data.instrumentKey));

    const endTime = performance.now();
    output.succeed(`Added indicator in ${Math.round(endTime - startTime)} ms; indicator took took ${Math.round(indicatorTime - startTime)} ms`);

    return {
        ...data,
        timeSeries: mergedData,
    };

};
