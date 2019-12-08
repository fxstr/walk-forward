import calculatePositionValue from './calculatePositionValue.mjs';

/**
 * Calculates current value of all positions passed in and returns them as a Map
 * @param  {{size: number, openPrice: number, instrument: string}[]} positions
 *                                         Positions that values should be calculated for.
 * @param  {Map.<string, number>} previousPositionValues  Position values from previous bar (needed
 *                                         for missing data on current bar)
 * @param  {Map.<string, number>} currentPrices    Current instrument prices; key is instrument
 *                                         name, value is price
 * @return {Map.<string, number>}          Current poisition values; key is the instrument name,
 *                                         value the current position value.
 */
export default (positions, previousPositionValues, currentPrices) => (
    new Map(positions.map(position => (
        [
            position.instrument,
            // If instrument has an open value for the current date, calculate its current value
            // using it.
            currentPrices.has(position.instrument) ?
                calculatePositionValue(
                    position.size,
                    position.openPrice,
                    currentPrices.get(position.instrument),
                ) :
                // If there is no open data for the instrument on the current date, use previous
                // value. As there is no open data, this instrument was *not* traded and must
                // therefore already have existed as a previous position.
                previousPositionValues.get(position.instrument),
        ]
    )))
);
