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
        selected: false,
        order: undefined,
        weight: 1,
        trade: 1,
    };
}
