/**
 * We don't want to trade an instrument that has rebalance === false on current bar *and* that
 * has a previous position that goes in the same direction as the orders for the current bar.
 * It would be easier to use previous instructions.selected – but as there's no guarantee it has
 * been executed (e.g. due to missing money), we might still need to trade on current bar.
 * @param {object[]} instructions   Instructions as created by createDefaultInstruction
 * @param {object[]} previousPositions   Previous positions, each with instrument and size property
 * @return {object[]}               Instructions that should be traded on the current bar
 */
export default (instructions, previousPositions) => (

    instructions.filter((instruction) => {
        // If rebalance is true, we're gonna trade even if there was a position
        if (instruction.rebalance) return true;

        const previousPosition = previousPositions
            .find(position => position.instrument === instruction.instrument);
        const previousSize = (previousPosition && previousPosition.size) || 0;

        if (Math.sign(previousSize) !== instruction.selected) return true;
        return false;
    })

);
