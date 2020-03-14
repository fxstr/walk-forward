import calculatePositionValue from './calculatePositionValue.mjs';

/**
 * Creates a single position object. To update it, use updatePosition.
 * @param {string} instrument
 * @param {number} size
 * @param {number} currentPrice
 * @param {number} marginPrice       Absolute price effectively paid for the instrument (i.e.
 *                                   absolute margin)
 * @return {object}                  Position created
 */
export default (instrument, size, currentPrice, marginPrice = currentPrice, pointValue = 1) => ({
    instrument,
    // When position is create, we're always at the open state of the bar
    type: 'open',
    size,
    // Value on open is always price paid per instrument * size
    value: calculatePositionValue(
        size,
        currentPrice,
        currentPrice,
        marginPrice,
        pointValue,
        pointValue,
    ),
    // Data about the moment the position was created. We cannot use positionValue here as the
    // position's size may shrink/grow. When the position is closed, we must be able to calculate
    // the position's *original* value with the *current* size (at the time of close).
    created: {
        // createPosition is only used to create new positions (else we use updatePosition) –
        // therefore barsSince is always 0
        barsSince: 0,
        // Open price and initial margin price are used to calculate gain/loss for position
        price: currentPrice,
        marginPrice,
        pointValue,
    },
});
