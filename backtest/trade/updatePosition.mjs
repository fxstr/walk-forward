import calculatePositionValue from './calculatePositionValue.mjs';

export default (
    position,
    isClosing = false,
    price,
    pointValue = 1,
) => {

    const type = isClosing ? 'close' : 'open';

    // If there is no price for the current bar, then there's nothing to update, except for type.
    // barsHeld is not counted up as there is no current bar for the position's instrument.
    if (price === undefined) {
        return {
            ...position,
            type,
        };
    }

    // If type is open, it's a new bar. Count up barsHeld
    const barsSince = isClosing ? position.created.barsSince : position.created.barsSince + 1;

    const value = calculatePositionValue(
        position.size,
        position.created.price,
        price,
        position.created.marginPrice,
        position.created.pointValue,
        pointValue,
    );

    return {
        ...position,
        type: isClosing ? 'close' : 'open',
        value,
        created: {
            ...position.created,
            barsSince,
        },
    };

};
