import stats from 'simple-statistics';
import walkSeries from './walkSeries.mjs';

/**
 * Creates an rSquared indicator
 * @param  {object} opptions
 * @param {object} options.options
 * @param {number} options.options.length    Duration of timeSeries we are using for
 *                                           linearRegression on which rSquared is based
 */
export default options => data => (

    walkSeries(data, options, (instrumentData) => {
        if (!options.options || !options.options.length || typeof options.options.length !== 'number') {
            throw new Error(`rSquared: Options object passed in must contain options.multiplier that is a number, is ${JSON.stringify(options)} instead.`);
        }
        const { length } = options.options;
        const mainRow = instrumentData.get('in');

        return new Map([[
            'out',
            mainRow.reduce((previous, entry) => {
                previous.series.push(entry);
                // There were not yet enough entries to calculate linearRegression with length
                // length: Just use undefined
                if (previous.series.length < length) {
                    previous.result.push(undefined);
                }
                // There are enough entries to calculate linearRegression
                else {
                    const seriesLength = previous.series.length;
                    // Get {length} last entries of previous.series
                    const linearRegressionData = previous.series
                        .slice(
                            seriesLength - length,
                            seriesLength,
                        )
                        // Use numbers from 0 up as x axis (or should we use time?). Should work
                        // as distance between every x is basically the same – and that's what
                        // counts
                        .map((item, index) => [index, item]);
                    const linearRegression = stats.linearRegression(linearRegressionData);
                    const rSquared = stats.rSquared(
                        linearRegressionData,
                        stats.linearRegressionLine(linearRegression),
                    );
                    previous.result.push(rSquared);
                }
                return previous;
            }, { series: [], result: [] }).result,
        ]]);

    })

);
