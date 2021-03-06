import { performance } from 'perf_hooks';
import groupBy from '../dataHelpers/groupBy.mjs';
import spinner from '../spinner/spinner.mjs';

/**
 * Abstract implementation for select, weight, trade.
 * @param {object} data                   Data as generated by useData
 * @param {function} instructionFunction  User-provided function that creates the instruction; is
 *                                        called with 3 arguments:
 *                                        - timeSeries entries for current entry, reverse
 *                                          chronological order
 *                                        - instrument name for current entry
 *                                        - timeSeries entries for all other instruments as a Map,
 *                                          key is instrument's name and value is instrument's data
 *                                          in reverse chronological order
 * @param {string} instructionField       Field in data.instructions that should be updated
 * @param {function} validateFunction     Function that validates return value from
 *                                        instructionFunction
 * @return {object}                       data as received in arguments with updated instructions
 */
export default (data, instructionFunction, instructionField, validateFunction = val => val) => {

    const output = spinner(`Executing ${instructionField} instructions …`);
    const startTime = performance.now();

    if (typeof instructionFunction !== 'function') {
        throw new Error(`createInstructionMethod: Second argument must be a function, is ${instructionFunction} instead.`);
    }
    if (typeof instructionField !== 'string') {
        throw new Error(`createInstructionMethod: Third argument (instructionField) must be a string, is ${instructionField} instead.`);
    }

    const { instrumentKey } = data;

    const dataGroupedByDate = groupBy(
        data.timeSeries,
        item => item.get('date'),
    );

    const instructionsGroupedByDate = groupBy(
        data.instructions,
        item => item.date,
    );

    if (data.timeSeries.length !== data.instructions.length) {
        throw new Error(`createInstructionMethod: timeSeries and instructions must have the same size, is ${data.timeSeries.length} vs. ${data.instructions.length}.`);
    }

    // Re-use timeSeries to improve performance; if we don't optimize for speed, calls may
    // take a few minutes.
    // Using a reducer instead of a for-of loop slows things down heavily (a few seconds for
    // 140 instrs/50 years)
    const timeSeriesForFunction = new Map(Array
        .from(data.instruments)
        .map(instrumentName => [instrumentName, []]));

    // Pass previous instructions to current function so that user can e.g. check if an instrument
    // was selected on previous bar
    const instructionsForFunction = new Map(Array
        .from(data.instructions)
        .map(instruction => [instruction.instrument, []]));

    // One entry per date, which contains an array of instructions (for every instrument available
    // on that date)
    // Just pushing to this array and flattening it at the end speeds things up a lot
    const instructions = [];

    // When calling instructionFunction, params for a certain date are always the same; therefore
    // we walk through timeSeries date by date, use the same params on one given date and just add
    // the new data to the previous date's data
    dataGroupedByDate.forEach(([, dataForDate], dateIndex) => {

        // Go through timeSeries entries for every instrument on current date
        // Add data for current date (for all instruments that have data available, as this is
        // known at that point in time) to timeSeriesForFunction
        for (const dataSet of dataForDate) {
            // I don't like that: We're updating data on a structure we previously used as
            // an argument; it might have been modified by the user. But: This is *so* much faster
            // than cloning timeSeriesForFunction *and* all its values, that it just makes sense
            const previousValues = timeSeriesForFunction.get(dataSet.get(instrumentKey));
            previousValues.unshift(dataSet);
        }

        // Go through data for all instruments
        // Generate instructions for every instrument on current date
        const instructionSet = dataForDate.map((dataSet) => {

            const instrumentName = dataSet.get(instrumentKey);

            const validatedInstructions = validateFunction(instructionFunction(
                // First argument: Array of previous data for current instrument, where most
                // recent entry is at the start (can be accessed through [0])
                timeSeriesForFunction.get(instrumentName),
                // Second argument: Name of current instrument
                instrumentName,
                // Third argument: All timeSeries' previous entries as a Map, where they key is
                // the instrument's name; value is reversed, so that latest entry can be accessed
                // with [0]
                // If we filtered for all instruments *other* than instrumentName, we'd lose
                // approx. 89% of speed (45 sec for 140 instrs/50 years vs 5 sec)
                timeSeriesForFunction,
                // Fourth argument: All previous instructions in the same form as third argument
                // (Map with instrumentName as key and instructions in an a reversed array)
                instructionsForFunction,
            ));

            return validatedInstructions;

        });

        // Add current instructionSet to instructionsForFunction so that it is available in the
        // next loop as an argument for instructionFunction
        instructionSet.forEach((instruction, instructionIndex) => {
            // Key [1] selects value of groupBy (instead of key which is the date)
            const existingInstructionsForDateAndInstrument =
                instructionsGroupedByDate[dateIndex][1][instructionIndex];
            // Merge other instructions for same date/instrument with new field
            const mergedInstructions = {
                ...existingInstructionsForDateAndInstrument,
                [instructionField]: instruction,
            };
            // Add to instructions that will be returned; needs to be a (flat) array sorted by
            // date/instrument
            instructions.push(mergedInstructions);
            // Add to instructionsForFunction that has a data structure that is completely
            // different from instructions
            instructionsForFunction
                .get(existingInstructionsForDateAndInstrument.instrument)
                .unshift(mergedInstructions);
        });

    });

    const endTime = performance.now();
    const timeDiff = Math.round(endTime - startTime);
    const timePerInstruction = Math.round((timeDiff / data.instructions.length) * 1000) / 1000;
    output.succeed(`Executed ${instructionField}, created ${data.instructions.length} instructions in ${timeDiff} ms (${timePerInstruction} per instruction)`);

    return {
        ...data,
        instructions,
    };

};

