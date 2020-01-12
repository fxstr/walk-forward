export default result => (

    result.reduce((previous, entry) => {

        const closed = previous.result.positions.filter((previousPosition) => {
            // Get current positions entry for same instrument
            const currentPosition = entry.positions
                .find(({ instrument }) => instrument === previousPosition.instrument);
            // If position existed but does not any more, it was closed
            if (!currentPosition) return true;
            // If position size's sign changed, position was switched (long to short or opposite),
            // which equals closing an existing and opening a new position
            if (Math.sign(currentPosition.size) !== Math.sign(previousPosition.size)) return true;
            return false;
        });

        // This is all fake but works for slow positions. Use close price of opening day as open
        // value (instead of open price) and close price of bar prior to close as close value.
        // Dont include positions that are still open when backtest ends as they will probably not
        // be closed on that date, but later.
        // TODO: Fix; use open values of opening and closing day instead. We have to change
        // results a lot for that.
        const adjustedClosed = closed.map(closedPosition => ({
            openDate: closedPosition.openDate,
            closeDate: entry.date,
            openValue: Math.abs(closedPosition.marginPrice * closedPosition.size),
            closeValue: previous.result.positionValues.get(closedPosition.instrument),
            instrument: closedPosition.instrument,
        }));

        return {
            result: entry,
            closed: [...previous.closed, ...adjustedClosed],
        };
    }, { result: { positions: [] }, closed: [] }).closed

);
