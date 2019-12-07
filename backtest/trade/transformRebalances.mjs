/**
 * We don't want to trade an instrument that has rebalance === false on current bar *and* that
 * has a previous position that goes in the same direction as the orders for the current bar.
 * We cannot rely on previous *positions* though, as they may not have been created (because money
 * was tight, e.g.); therefore we use the previous selected instruction.
 * To simplify things, we add the property trade = false to the next bar if we should not
 * rebalance on that date
 * @param {object[]} instructions   Instructions as created by createDefaultInstruction
 * @return {object[]}               Instructions as they were passed in with an additional property
 *                                  trade that is false if no trading should happen on that date
 *                                  for the given instrument.
 */
export default (instructions) => {

    // Map.<string, number> with the previous value for the selected instruction for the given
    // instrument
    const previouslySelectedValues = new Map();

    return instructions.map((instruction) => {

        const trade = instruction.rebalance === true ||
            (previouslySelectedValues.get(instruction.instrument) || 0) !== instruction.selected;

        previouslySelectedValues.set(instruction.instrument, instruction.selected);

        return { ...instruction, trade };

    });

};
