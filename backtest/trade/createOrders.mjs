/**
 * Creates orders from instructions, e.g. converts (relative) weight into an (absolute) size.
 * @param {Object[]} instructions           See createDefaultInstructions.mjs
 * @param {Map.<string, number>} prices     Current (close) prices at the date when the orders
 *                                          are created. Key is instrument name, value is price.
 * @param {Number} accountValue             Total account value available (cash plus all positions)
 * @param {Number} investedRatio            Ratio that should be invested (i.e. not be held as cash)
 * @param {Number} maxRatioPerInstrument    Percent of amountToInvest that can be allotted to a
 *                                          single position/instrument at max.
 * @return {Map.<string, number>}           Orders; key is the instrument's name, value the order
 *                                          size
 */
export default (
    instructions,
    prices,
    currentPositions,
    accountValue,
    investedRatio = 1,
    maxRatioPerInstrument = 1,
) => {

    // Ignore instructions that are not traded on the current date (because they are not being
    // rebalanced, see transformRebalances)
    const validInstructions = instructions.filter(({ trade }) => trade !== false);

    // Get sum of all weights
    const totalWeight = validInstructions.reduce((sum, { weight }) => sum + weight, 0);
    const amountToInvest = accountValue * investedRatio;
    // Max amount per instrument should always be calculated based on total accountValue, not
    // amountToInvest
    const maxAmountPerInstrument = accountValue * maxRatioPerInstrument;

    const newPositions = validInstructions
        // Create array with [instrumentName, amountForThisInstrument, instruction]
        .map(instruction => [
            instruction.instrument,
            // 2nd entry is amount to be invested in this instrument
            // If totalWeight is 0, use 0; we cannot divide by it.
            totalWeight === 0 ? 0 : Math.min(
                (instruction.weight / totalWeight) * amountToInvest,
                maxAmountPerInstrument,
            ),
            instruction,
        ])
        // Calculate sizes by creating an array with [instrumentName, size]
        .map(([instrument, amount, instruction]) => [
            instrument,
            Math.floor(amount / prices.get(instrument)) * instruction.selected,
        ])
        // Convert absolute size to relative size (position to value)
        .map(([instrument, positionSize]) => [
            instrument,
            positionSize - (currentPositions.get(instrument) || 0),
        ])
        // Filter out all orders with size 0; === also catches -0
        .filter(([, orderSize]) => orderSize !== 0);

    return new Map(newPositions);

};
