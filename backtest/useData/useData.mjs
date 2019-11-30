import { performance } from 'perf_hooks';
import logger from '../logger/logger.mjs';
import createDefaultConfiguration from './createDefaultConfiguration.mjs';
import spinner from '../spinner/spinner.mjs';
import sortBy from '../dataHelpers/sortBy.mjs';

const { debug } = logger('WalkForward:useData');

/**
 * Transforms raw data from any source into internal data that is passed from function to function
 */
export default function useData(emptyData, csvData) {

    debug('useData called');
    const startTime = performance.now();
    const output = spinner('Loading files …');

    // We add instrument to the existing timeEntries; in order to prevent clashes with existing
    // keys, we use a Symbol as the key for instrument data.
    const instrumentKey = Symbol('instrumentKey');

    const result = {
        instruments: new Set(),
        instrumentKey,
        // Must always be sorted chronologically. If we have to re-sort during execution, we lose
        // a few secs for every sort operation
        timeSeries: [],
        // Must always be sorted chronologically (see timeSeries above)
        instructions: [],
        instructionFunctions: [],
        viewOptions: {},
        result: {},
        configuration: createDefaultConfiguration(),
    };

    let fileIndex = 0;

    // Go through every instrument
    for (const [instrumentName, instrumentData] of csvData) {
        result.instruments.add(instrumentName);
        // Check if dates are duplicate
        const usedDates = new Set();

        // Go through every entry in instrument's timeSeries
        for (const timeEntry of instrumentData) {

            // Make sure date is valid
            if (typeof timeEntry.get('date') !== 'number') {
                throw new Error(`useData: Every row must contain a property 'date' which is a timestamp; this is not the case for row ${JSON.stringify(Array.from(timeEntry.values()))} of instrument ${instrumentName}.`);
            }

            // Check if date is a duplicate for a given instrument
            if (usedDates.has(timeEntry.get('date'))) {
                throw new Error(`useData: Date ${timeEntry.get('date')} is a duplicate for instrument ${instrumentName}.`);
            }
            usedDates.add(timeEntry.get('date'));

            // Add instrumentName to existing timeEntry; use instrumentKey to not overwrite an
            // existing object key
            const entryWithInstrument = new Map([...timeEntry, [instrumentKey, instrumentName]]);
            result.timeSeries.push(entryWithInstrument);

        }

        fileIndex++;
        output.setText(`Loading files ${fileIndex}/${csvData.size}`);

    }

    // Sort everything chronologically and thereafter by instrument name
    result.instructions.sort(sortBy('date', instrumentKey));
    result.timeSeries.sort(sortBy('date', 'instrument'));

    const endTime = performance.now();
    output.succeed(`${csvData.size} files loaded in ${Math.round(endTime - startTime)} ms`);

    return result;

}
