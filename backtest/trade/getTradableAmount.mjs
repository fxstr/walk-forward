/**
 * Calculates the total amount that is available for trading on a bar (excluding cash). Corresponds
 * to the value of all positions that we hold and that are traded on the current bar.
 */
export default (instructions, positionValues) => (
    instructions.reduce((sum, instruction) => (
        sum + (positionValues.get(instruction.instrument) || 0)
    ), 0)
);
