/**
 * Merges any amount of positions into one single position
 * @param {Object} positions    Positions to merge. See createPosition for structure.
 */
export default (...positions) => positions.slice(1).reduce(
    (combined, position) => {

        if (combined.instrument !== position.instrument) throw new Error(`mergePositions: The instruments of the positions you try to merge differ, they are ${combined.instrument} and ${position.instrument}.`);

        // Merged position's size
        const size = combined.size + position.size;

        // Open date: Use date of combined position if position is extended; else (new position,
        // opposite direction) use new date
        const openDate = (Math.sign(combined.size) === Math.sign(size)) ?
            combined.openDate : position.openDate;

        // Open price:
        // - If position is reduced, use combined price (default)
        // - If position is extended, use average weighted by size
        // - If position is created (from 0/opposite direction), use new price
        let { openPrice } = combined;
        if (Math.sign(combined.size) === Math.sign(position.size)) {
            openPrice = (
                (combined.openPrice * Math.abs(combined.size)) +
                (position.openPrice * Math.abs(position.size))
            ) /
            (Math.abs(combined.size) + Math.abs(position.size));
        }
        else if (Math.sign(size) !== Math.sign(combined.size)) ({ openPrice } = position);

        return {
            instrument: position.instrument,
            size,
            openPrice,
            openDate,
        };
    },
    // Start with first position, merge all others into this one
    positions[0],
);
