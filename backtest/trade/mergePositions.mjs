import createPosition from './createPosition.mjs';
import calculatePositionValue from './calculatePositionValue.mjs';

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

        // If position's direction changes, return a new position; if position is closed, re-use
        // previous position.
        if (Math.sign(combined.size) !== Math.sign(size) && size !== 0) {
            return createPosition(
                position.instrument,
                size,
                position.created.price,
                position.created.marginPrice,
                position.created.pointValue,
            );
        }

        // Price, marginPrice and pointValue
        // - If position is reduced, use combined (old) price (default value)
        // - If position is extended, use average weighted by size
        // - If position is created (from 0/opposite direction; but not closed), use new price
        let { price, marginPrice, pointValue } = combined.created;
        if (Math.sign(combined.size) === Math.sign(position.size)) {
            const combinedWeight = Math.abs(combined.size) /
                (Math.abs(combined.size) + Math.abs(position.size));
            const getCombined = priceType => (combined.created[priceType] * combinedWeight) +
                (position.created[priceType] * (1 - combinedWeight));
            price = getCombined('price');
            marginPrice = getCombined('marginPrice');
            pointValue = getCombined('pointValue');
        }
        else if (Math.sign(size) !== Math.sign(combined.size) && size !== 0) {
            ({ price, marginPrice, pointValue } = position.created);
        }

        const value = calculatePositionValue(
            size,
            price,
            position.created.price,
            marginPrice,
            pointValue,
            position.created.pointValue,
        );

        return {
            ...position,
            size,
            value,
            created: {
                // Always re-use previous barsSince (except if positions are newly created which
                // is handled separately above)
                ...combined.created,
                price,
                marginPrice,
                pointValue,
            },
        };
    },
    // Start with first position, merge all others into this one
    positions[0],
);

