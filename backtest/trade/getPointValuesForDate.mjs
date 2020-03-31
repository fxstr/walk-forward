/**
 * Calls getPointValueFunction for trading dates with instruments that contain data on the given
 * date.
 * @param  {string[]} instruments            Instruments that contain data for the given date
 * @param  {function} getPointValueFunction  Function that returns point value
 * @param  {number} date                     Date in ms
 * @return {Map.<string, number>}            Key is instrument name, value is point value at the
 *                                           given date
 */
export default (instruments, getPointValueFunction, date) => (

    // Map.<string, number> with point value for every relevant instrument on current date
    new Map(instruments
        .map((instrument) => {
            const pointValue = getPointValueFunction(instrument, date);
            if (typeof pointValue !== 'number' && pointValue !== undefined) {
                throw new Error(`getPointValuesForDate: pointValue must be undefined or a number, is ${JSON.stringify(pointValue)} instead.`);
            }
            return [instrument, pointValue];
        }))

);
