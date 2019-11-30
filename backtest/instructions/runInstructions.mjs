import createDefaultInstructions from '../useData/createDefaultInstructions.js';

/**
 * Runs instructions for a certain date. Updates data that is passed to instructionFunction.
 * @param  {object[]} instructionData    See addInstructionFunction.mjs; array of objects with
 *                                       instructionFunction, instructionField, validate
 * @param  {Map[]} timeSeriesEntries     One or multiple timeSeries entries for one certain date
 *                                       (one entry per instrument)
 * @param  {Symbol} instrumentKey        Key for instrument in timeSeriesEntries
 * @param  {Map.<string, Map[]>} previousInstructionFunctionArguments     Data that previous
 *                                       instructionFunction was called with; key is instrument
 *                                       name, value is an array of timeSeries entries.
 * @return {Object}                      Object with properties instructions (all
 *                                       instructions for a certain date) and
 *                                       instructionFunctionArguments for next instructionFunctions
 *                                       call.
 */
export default (
    instructionData,
    timeSeriesEntries,
    instrumentKey,
    previousInstructionFunctionArguments,
) => {

    // Create new data. We do this in a dangerous way as we're modifying the data that was passed
    // as an argument. This, however, improves performance by a lot.
    // TODO: Check if we can clone data instead.
    timeSeriesEntries.forEach((entry) => {
        const instrumentName = entry.get(instrumentKey);
        if (!previousInstructionFunctionArguments.has(instrumentName)) {
            previousInstructionFunctionArguments.set(instrumentName, []);
        }
        previousInstructionFunctionArguments.get(instrumentName).unshift(entry);
    });

    // Run functions
    const newInstructions = timeSeriesEntries.map(entry => ({
        instrument: entry.get(instrumentKey),
        date: entry.get('date'),
        ...instructionData.reduce((prev, instruction) => ({
            ...prev,
            [instruction.instructionField]: instruction.validate(instruction.instructionFunction(
                previousInstructionFunctionArguments.get(entry.get(instrumentKey)),
                entry.get(instrumentKey),
                previousInstructionFunctionArguments,
            )),
        }), {}),
    }));

    const instructions = { ...createDefaultInstructions(), newInstructions };

    // Return stuff
    return { instructions, instructionFunctionArguments: previousInstructionFunctionArguments };

};

