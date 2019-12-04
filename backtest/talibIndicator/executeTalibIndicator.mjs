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

                // Create an array of undefined with the length of result.begIndex; result
                // does not have a property begIndex if timeSeries was too short for params provided
                // (e.g. SMA100 with only 10 data sets)
                if (result.begIndex) {
                    const emptyValues = Array.from({ length: result.begIndex }, () => undefined);
                    returnValue[key].unshift(...emptyValues);
                }

                // If data set is smaller than params provided (e.g. SMA10 with only 10 data sets),
                // talib wil return { outReal: [] } without any further params. We have to
                // construct undefined values from the input's length.
                if (result.begIndex === 0 && result.nbElement === 0) {
                    const explanation = talib.explain(options.name);
                    // Use the first data input provided
                    const inputName = explanation.inputs && explanation.inputs.length &&
                        explanation.inputs[0].name;
                    if (!options[inputName]) {
                        throw new Error(`executeTalibIndicator: First input field according to talib is ${inputName}; it is not available on talib options ${JSON.stringify(options)}, however.`);
                    }
                    const inputLength = options[inputName].length;
                    returnValue[key] = Array.from({ length: inputLength }, () => undefined);
                }

            });
            return resolve(returnValue);

        });

    });

}
