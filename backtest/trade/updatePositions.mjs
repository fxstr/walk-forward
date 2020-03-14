/**
 * Updates all positions value with current prices. If price is not provided (e.g. because
 * instrument is not traded on current bar), previous value is used.
 * @param {object[]} positions                Positions, as returned by createPosition
 * @param {boolean} isClosing                 Use true on close, false on open
 * @param {Map.<string, number>} prices       Current prices
 * @param {Map.<string, number>} pointValues  Current pointValues
 * @return {object[]}                         Updated positions (with new values and increased
 *                                            barsHeld)
 */
export default (
    positions,
    updateFunction,
    isClosing,
    prices = new Map(),
    pointValues = new Map(),
) => (
    positions
        // Clone the whole data structure to never modify the original
        .map(position => (
            updateFunction(
                position,
                isClosing,
                prices.get(position.instrument),
                pointValues.get(position.instrument),
            )
        ))
);
