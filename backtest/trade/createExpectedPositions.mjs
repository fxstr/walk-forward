/**
 * Creates orders from instructions, e.g. converts (relative) weight into an (absolute) size.
 * @param {Object[]} instructions           See createDefaultInstructions.mjs
 * @param {Map.<string, number>} prices     Current prices at the date when the orders
 *                                          are created. Key is instrument name, value is price.
 *                                          Depends on configuration.instructionField.
 * @param {Number} maxAmount                Max amount that can be invested in total; should be
 *                                          the smaller of (all money available * invested ratio)
 *                                          or (amount available for trading)
 * @param {Number} maxAmountPerInstrument   Max amount that we can invest for a single instrument
 * @param {Map.<string, number} pointValues Current values in base currency if instrument changes
 *                                          by one point (includes contract size, exchange rate)
 * @return {Map.<string, number>}           Expected positions; key is the instrument's name, value
 *                                          the expected position size
 */
export default (
    instructions,
    instructionFieldPrices,
    maxAmount,
    maxAmountPerInstrument,
    pointValues = new Map(),
) => {

    // Get sum of all weights
    const totalWeight = instructions.reduce((sum, { weight }) => sum + weight, 0);

    const newPositions = instructions
        // Create array with [instrumentName, amountForThisInstrument, instruction]
        .map(instruction => [
            instruction.instrument,
            // 2nd entry is amount to be invested in this instrument
            // If totalWeight is 0, use 0; we cannot divide by it.
            totalWeight === 0 ? 0 : Math.min(
                (instruction.weight / totalWeight) * maxAmount,
                maxAmountPerInstrument,
            ),
            instruction,
        ])
        // Calculate sizes by creating an array with [instrumentName, size]
        .map(([instrument, amount, instruction]) => [
            instrument,
            Math.floor(amount / (instructionFieldPrices.get(instrument) *
                (pointValues.get(instrument) || 1))) * instruction.selected,
        ]);

    return new Map(newPositions);

};
