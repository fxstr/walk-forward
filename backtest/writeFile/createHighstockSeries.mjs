import logger from '../logger/logger.mjs';

const { debug } = logger('WalkForward:createHighstockSeries');

/**
 * Creates Highstock series for all data other than OHLC
 * @param  {Map[]} data     Data to be exported
 * @param  {Set} fields     Set of fields that should be handled (usually all fields expect for
 *                          OHLC if they were set)
 * @param {Object} seriesViewOptions    View options for all series
 * @return {Object[]}       Highstock config for series
 */
export default function createHighstockSeries(data, fields, seriesViewOptions) {

    const result = [];

    fields.forEach((fieldName) => {

        // Don't create a series for date
        if (fieldName === 'date') return;

        debug('Create series for field %o', fieldName);

        // Convert data to flat array for fields
        const fieldData = data.map(entry => [
            entry.get('date'),
            entry.get(fieldName),
        ]);

        // There are viewOptions
        if (seriesViewOptions && seriesViewOptions.get(fieldName)) {

            const { panel, ...options } = seriesViewOptions.get(fieldName);

            // If panel is false, user does not want to display series in Highstock; continue
            // to next series.
            if (panel === false) {
                debug('Series %s is not visible, panel is false');
                return;
            }

            debug('Add series %o to panel %s', options, panel);
            // Rename 'panel' property to 'yAxis'
            result.push({
                // Default type line; is overwritten by options, if provided
                type: 'line',
                name: fieldName,
                ...options,
                yAxis: panel || 'main',
                data: fieldData,
            });
        }

        // No view options: Use defaults
        else {
            debug('Series %o has no view options', fieldName);
            result.push({
                type: 'line',
                yAxis: 'main',
                name: fieldName,
                data: fieldData,
            });
        }
    });

    return result;

}
