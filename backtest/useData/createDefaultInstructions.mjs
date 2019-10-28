/**
 * Creates a default instruction for a given date and instrument
 * @param  {String} instrumentName
 * @param  {Number} date
 * @return {Object}
 */
export default function createDefaultInstructions(instrumentName, date) {
    return {
        date,
        instrument: instrumentName,
        // Is instrument selected? Only trade/respect weight if true.
        selected: false,
        // Sometimes, we want to select e.g. only the best performing instruments – use order
        // to sort instruments (at a given time) e.g. by performance.
        order: undefined,
        // Weight of this instrument; if all instruments have the same weight, the same amount of
        // money will be allocated to all of them.
        weight: 1,
        // Should we trade on the current date?
        trade: 1,
    };
}
