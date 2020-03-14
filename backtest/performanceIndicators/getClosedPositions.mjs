import groupBy from '../dataHelpers/groupBy.mjs';
import calculatePositionValue from '../trade/calculatePositionValue.mjs';

/**
 * Gets parameters (open and final close price etc.) for all closed positions
 * @param  {object[]} result     Result as created by trade.mjs; object has properties date, orders
 *                               positions etc.
 * @return {object[]}            Array with one entry per closed position; every closed position
 *                               has properties bars, openValue, closeValue, instrument.
 */
export default result => (

    result.reduce((previouslyClosedPositions, entry) => {

        // Group positions for *one bar* together by instrument.
        const positionsGroupedByInstrument = groupBy(
            entry.positions,
            ({ instrument }) => instrument,
        );

        // Positions for an instrument are closed if
        // a) there is a position on open, but not not on close
        // b) position switches long/short from open to close
        const closedPositions = positionsGroupedByInstrument
            .filter(([, positions]) => (
                // There is only 1 position for that bar and instrument: If it's of type open,
                // position was closed
                (positions.length === 1 && positions[0].type === 'open') ||
                // There are 2 positions for that bar and instrument: Check if it was reversed;
                // there are no positions of size 0 or -0, we can ignore this case.
                (positions.length === 2 &&
                    Math.sign(positions[0].size) !== Math.sign(positions[1].size))
            ))
            // Only return an array of 'open' position types; always comes first in result for a
            // given date
            .map(([, positions]) => positions[0]);

        // Re-format closed positions
        const reformattedClosedPositions = closedPositions
            .map(closedPosition => ({
                bars: closedPosition.created.barsSince,
                // Calculate value of position when it was opened; make sure we use the current size
                // (for a fair comparison), as size might have changed over the position's livetime.
                openValue: calculatePositionValue(
                    closedPosition.size,
                    closedPosition.created.price,
                    closedPosition.created.price,
                    closedPosition.created.marginPrice,
                    closedPosition.created.pointValue,
                    closedPosition.created.pointValue,
                ),
                closeValue: closedPosition.value,
                instrument: closedPosition.instrument,
            }));

        return [...previouslyClosedPositions, ...reformattedClosedPositions];

    }, [])

);
