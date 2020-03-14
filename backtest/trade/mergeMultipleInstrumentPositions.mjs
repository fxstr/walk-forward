import groupBy from '../dataHelpers/groupBy.mjs';

/**
 * Takes positions (for a single date) for multiple instruments and merges all positions of an
 * instrument together. Later positions are merged into previous ones.
 * @param {object[]} allPositions     Positions to merge; each position with at least a property
 *                                    instrument.
 */
export default (allPositions, mergeFunction) => {
    // Concat old and new positions, group by instrument
    const positionsGroupedByInstrument = groupBy(
        // Make sure previous positions come first, as new positions should be merged into previous
        // ones (and not the opposite)
        allPositions,
        ({ instrument }) => instrument,
    );

    // Merge multiple positions of the same instrument into one single position
    return positionsGroupedByInstrument
        // Merge old and new positions of the same instrument
        .map(([, positionData]) => mergeFunction(...positionData))
        // Remove all empty positions – but only if they were empty previously. If a position is
        // empty for the first time, leave it at 0. Only then, we can evaluate it to get a
        // performance indication of our strategy (to know if a position was winning or losing,
        // we need to know the price it was sold for).
        .filter(position => position.size !== 0);
};
