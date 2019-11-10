import sortBy from '../dataHelpers/sortBy.mjs';
import groupBy from '../dataHelpers/groupBy.mjs';

/**
 * Sets selected on instructions depending on the returnValue of selectFunction.
 * @param  {Function} selectFunction Function that returns -1 (go short), 0 (don't trade) or 1 (go
 *                                   long) if instrument is selected for trading on given date. Is
 *                                   called with arguments:
 *                                   - current entry of timeSeries (for a certain date and
 *                                     instrument)
 *                                   - name of the instrument (for the current entry)
 *                                   - all previous timeSeries entries as a Map, where the key is
 *                                     the instrument's name and value is an array of all data sets,
 *                                     sorted in inversed chronological order (newest first)
 * @return {Object}                  Data as created by useData
 */
export default (data, selectFunction) => {

    const { instrumentKey } = data;

    // Sort timeSeries and instructions the same way so that we can access the matching data pair
    // (same date/instrument) by using indexes.
    const sortedData = [...data.timeSeries].sort(sortBy('date', instrumentKey));
    const sortedInstructions = [...data.instructions].sort(sortBy('date', 'instrument'));
    if (sortedData.length !== sortedInstructions.length) {
        throw new Error(`select: timeSeries and instructions must have the same size, is ${sortedData.length} vs. ${sortedInstructions.length}.`);
    }

    // Make sure user returns -1, 0 or 1 in function passed to select
    const validate = (returnValue) => {
        if ([-1, 0, 1].includes(returnValue)) return returnValue;
        throw new Error(`select: Value returned by the function you pass to select must be -1, 0 or 1; you returned ${returnValue}.`);
    };

    return {
        ...data,
        instructions: sortedInstructions.map((instruction, index) => ({
            ...instruction,
            selected: validate(selectFunction(
                // First argument: Current entry of timeSeries
                sortedData[index],
                // Second argument: Name of current instrument
                sortedData[index].get(instrumentKey),
                // Third argument: *All* timeSeries' *previous* entries as a Map, where they key is
                // the instrument's name; reversed, so that latest entry can be accessed with [0]
                new Map(groupBy(
                    sortedData.slice(0, index + 1).reverse(),
                    item => item.get(instrumentKey),
                )),
            )),
        })),
    };

};

