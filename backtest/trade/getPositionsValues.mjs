import calculatePositionValue from './calculatePositionValue.mjs';

/**
 * Calculates current value of all positions passed in and returns them as a Map
 * @param {{size: number, openPrice: number, instrument: string}[]} positions
 *                                         Positions that values should be calculated for.
 * @param {Map.<string, number>} previousPositionValues  Position values from previous bar (needed
 *                                         for missing data on current bar)
 * @param {Map.<string, number>} currentPrices    Current instrument prices; key is instrument
 *                                         name, value is price
 * @param {Map.<string, number> pointValues}       Value of a point in the base currency; includes
 *                                         instrument's contract size and current exchange rate
 * @return {Map.<string, number>}          Current poisition values; key is the instrument name,
 *                                         value the current position value.
 */
export default (positions, previousPositionValues, currentPrices, pointValues = new Map()) => (
    new Map(positions.map(position => (
        [
            position.instrument,
            // If instrument has an open value for the current date, calculate its current value
            // using it.
            currentPrices.has(position.instrument) ?
                calculatePositionValue(
                    position.size,
                    // openPrice stays where it was
                    position.openPrice,
                    position.marginPrice,
                    currentPrices.get(position.instrument) *
                        (pointValues.get(position.instrument) || 1),
                ) :
                // If there is no open data for the instrument on the current date, use previous
                // value. As there is no open data, this instrument was *not* traded and must
                // therefore already have existed as a previous position.
                previousPositionValues.get(position.instrument),
        ]
    )))
);
