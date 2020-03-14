/**
 * Calculates the total amount that is available for trading on a bar (excluding cash). Corresponds
 * to the value of all positions that we hold and that are traded on the current bar.
 */
export default (instructions, positions) => (
    instructions.reduce((sum, instruction) => {
        const position = positions.find(({ instrument }) => instrument === instruction.instrument);
        return sum + ((position && position.value) || 0);
    }, 0)
);
