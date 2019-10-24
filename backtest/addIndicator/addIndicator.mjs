import logger from '../logger/logger.mjs';
import walkStructure from '../dataHelpers/walkStructure.mjs';
import findInTimeSeries from '../dataHelpers/findInTimeSeries.mjs';

const { debug } = logger('WalkForward:addIndicator');

/**
 * Adds an indicator to data
 * @param  {Object} data                Data structure as created by useData()
 * @param  {Function} indicatorFunction Function that will be called to create the indicators
 * @return {Object}                     Cloned data enriched with new indicator data
 */
export default async(data, indicatorFunction) => {

    // Clone data to not modify arguments
    const clonedData = walkStructure(data);

    const indicatorData = await indicatorFunction(clonedData);

    // Contains all keys (rows) that were newly added by indicator
    const seriesKeys = new Set();

    indicatorData.forEach((indicatorEntry) => {

        if (!indicatorEntry.has('date')) {
            throw new Error(`addIndicator: Indicator function did return an entry without a date: ${JSON.stringify(Array.from(indicatorEntry.entries()))}.`);
        }
        if (!indicatorEntry.has('instrument')) {
            throw new Error(`addIndicator: Indicator function did return an entry without an instrument: ${JSON.stringify(Array.from(indicatorEntry.entries()))}.`);
        }

        const originalEntry = findInTimeSeries(
            clonedData,
            indicatorEntry.get('instrument'),
            indicatorEntry.get('date'),
        );

        if (!originalEntry) {
            throw new Error(`addIndicator: Entry for date ${new Date(indicatorEntry.get('date'))} and instrument ${indicatorEntry.get('instrument')} not found in time series.`);
        }

        // Loop over properties of single indicatorData entry, add to originalEntry
        indicatorEntry.forEach((value, key) => {
            // instrument and date are already on originalEntry, do not need to be cloned
            if (key === 'instrument' || key === 'date') return;
            originalEntry.set(key, value);
            seriesKeys.add(key);
        });

    });

    return clonedData;

};
