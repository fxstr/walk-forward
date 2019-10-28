import sortBy from '../dataHelpers/sortBy.mjs';
import walkStructure from '../dataHelpers/walkStructure.mjs';

export default selectFunction => (data) => {

    const clone = walkStructure(data);
    // Sort timeSeries and instructions the same way so that we can access the matching data pair
    // (same date/instrument) by using indexes.
    const sortedData = clone.timeSeries.sort(sortBy('date', clone.instrumentKey));
    const sortedInstructions = clone.instructions.sort(sortBy('date', 'instrument'));

    if (sortedData.length !== sortedInstructions.length) {
        throw new Error(`select: timeSeries and instructions must have the same size, is ${sortedData.length} vs. ${sortedInstructions.length}.`);
    }

    const { instrumentKey } = clone;
    clone.instructions = sortedInstructions.map((instruction, index) => ({
        ...instruction,
        selected: selectFunction(
            // First argument: Current timeSeries entry
            sortedData[index],
            // Second argument: All *previous* timeSeries entries for current instrument
            sortedData
                .slice(0, index)
                .filter(value => value.get(instrumentKey) === sortedData[index].get(instrumentKey)),
            // Third argument: all *other* timeSeries (instruments) *previous* entries as a Map,
            // where they key is the instrument's name
            sortedData
                .slice(0, index)
                .filter(item => item.get(instrumentKey) !== sortedData[index].get(instrumentKey))
                .reduce((prev, item) => {
                    const currentInstrumentKey = item.get(instrumentKey);
                    if (prev.has(currentInstrumentKey)) prev.get(currentInstrumentKey).push(item);
                    else prev.set(currentInstrumentKey, [item]);
                    return prev;
                }, new Map()),

        ),
    }));

    return clone;

};

