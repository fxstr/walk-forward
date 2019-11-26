import talib from 'talib';

/**
 * Executes a talib indicator
 * @param  {Object} options    Options for talib call
 * @return {Promise}           Promise that is resolved when indicator has been executed. Resolves
 *                             to an object with key (row name) and value (array of values)
 */
export default function executeTalibIndicator(options) {

    return new Promise((resolve, reject) => {
        talib.execute(options, (err, result) => {

            // They expose an error property on err …
            if (err) return reject(new Error(err.error));

            const returnValue = result.result;
            // Prefix every returned column with as many undefined values as begIndex: SMA(3) only
            // returns values after 2 timeSeries entries; fill those 2 out with undefined.
            Object.keys(returnValue).forEach((key) => {
                // Create an array of undefined with the length of result.begIndex
                const emptyValues = Array.from({ length: result.begIndex }, () => undefined);
                returnValue[key].unshift(...emptyValues);
            });
            return resolve(returnValue);

        });

    });

}
