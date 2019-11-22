import createDefaultInstructions from './createDefaultInstructions.mjs';
import logger from '../logger/logger.mjs';
import createDefaultConfiguration from './createDefaultConfiguration.mjs';

const { debug } = logger('WalkForward:useData');

/**
 * Transforms raw data from any source into internal data that is passed from function to function
 */
export default function useData(emptyData, csvData) {

    debug('useData called');

    // We add instrument to the existing timeEntries; in order to prevent clashes with existing
    // keys, we use a Symbol as the key for instrument data.
    const instrumentKey = Symbol('instrumentKey');

    const result = {
        instruments: new Set(),
        instrumentKey,
        timeSeries: [],
        instructions: [],
        viewOptions: {},
        result: {},
        configuration: createDefaultConfiguration(),
    };

    // Go through every instrument
    for (const [instrumentName, instrumentData] of csvData) {
        result.instruments.add(instrumentName);
        // Check if dates are duplicate
        const usedDates = new Set();

        // Go through every entry in instrument's timeSeries
        for (const timeEntry of instrumentData) {

            // Make sure date is valid
            if (typeof timeEntry.get('date') !== 'number') {
                throw new Error(`useData: Every row must contain a property 'date' which is a timestamp; this is not the case for row ${JSON.stringify(timeEntry)} of instrument ${instrumentName}.`);
            }

            // Check if date is a duplicate for a given instrument
            if (usedDates.has(timeEntry.get('date'))) {
                throw new Error(`useData: Date ${timeEntry.get('date')} is a duplicate for instrument ${instrumentName}.`);
            }
            usedDates.add(timeEntry.get('date'));

            // Add instrumentName to existing timeEntry; use instrumentKey to not overwrite an
            // existing object key
            const entryWithInstrument = new Map(timeEntry);
            entryWithInstrument.set(instrumentKey, instrumentName);
            result.timeSeries.push(entryWithInstrument);

            // Add corresponding instructions
            result.instructions.push(createDefaultInstructions(
                instrumentName,
                timeEntry.get('date'),
            ));

        }

    }

    return result;

}
