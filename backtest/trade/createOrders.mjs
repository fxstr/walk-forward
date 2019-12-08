/**
 * Creates orders from difference between current and expected positions
 * @param {Map.<string, number>} expectedPositions     Expected positions; key is the instrument
 *                                                     name, value the position size
 * @param {Map.<string, number>} currentPositions      Current positions; key is the instrument
 *                                                     name, value the position size
 * @returns {Map.<string, number>}                     Orders; key is the instrument
 *                                                     name, value the position size
 */
export default (expectedPositions, currentPositions) => (
    new Map(Array
        .from(expectedPositions.entries())
        .map(([instrumentName, positionSize]) =>
            [instrumentName, positionSize - (currentPositions.get(instrumentName) || 0)])
        .filter(([, positionSize]) => positionSize !== 0))
);
