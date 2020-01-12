/**
 * Merges any amount of positions into one single position
 * @param {Object} positions    Positions to merge. See createPosition for structure. The later
 * position is merged into the previous position.
 */
export default (...positions) => positions.slice(1).reduce(
    (combined, position) => {

        if (combined.instrument !== position.instrument) throw new Error(`mergePositions: The instruments of the positions you try to merge differ, they are ${combined.instrument} and ${position.instrument}.`);

        // Merged position's size
        const size = combined.size + position.size;

        // Open date: Use date of combined (existing) position if position is extended, reduced or
        // closed; else (new position, opposite direction) use new date
        const openDate = (Math.sign(combined.size) === Math.sign(size) || size === 0) ?
            combined.openDate : position.openDate;

        // Open price:
        // - If position is reduced, use combined price (default)
        // - If position is extended, use average weighted by size
        // - If position is created (from 0/opposite direction), use new price
        let { openPrice, marginPrice } = combined;
        if (Math.sign(combined.size) === Math.sign(position.size)) {
            const combinedWeight = Math.abs(combined.size) /
                (Math.abs(combined.size) + Math.abs(position.size));
            openPrice = (combined.openPrice * combinedWeight) +
                (position.openPrice * (1 - combinedWeight));
            marginPrice = (combined.marginPrice * combinedWeight) +
                (position.marginPrice * (1 - combinedWeight));
        }
        else if (Math.sign(size) !== Math.sign(combined.size)) {
            ({ openPrice, marginPrice } = position);
        }

        return {
            instrument: position.instrument,
            size,
            openPrice,
            openDate,
            marginPrice,
        };
    },
    // Start with first position, merge all others into this one
    positions[0],
);
