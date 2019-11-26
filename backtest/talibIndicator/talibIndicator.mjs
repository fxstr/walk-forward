import { performance } from 'perf_hooks';
import executeTalibIndicator from './executeTalibIndicator.mjs';
import generateIndexesFromData from './generateIndexesFromTalibData.mjs';
import logger from '../logger/logger.mjs';
import convertColsToRows from '../addIndicator/convertColsToRows.mjs';
import addRowsToTimeSeries from '../addIndicator/addRowsToTimeSeries.mjs';

const { debug } = logger('WalkForward:talibIndicator');

/**
 * Executes a talib indicator, returns result.
 * @param {Object} param
 * @param {String} param.name       Indicator to execute, e.g. 'ADX'
 * @param {Object} param.inputs     Mapping of input params, e.g. {talibColumnName: dataColumnName}
 * @param {Object} param.outputs    Mapping of output params, e.g. { outReal: 'sma30' }
 * @param {Object} param.options    Additional options for indicator, e.g. { inReal: 4 }
 * @return {Function}               Function that is called with the current data
 */
export default function talibIndicator({
    name,
    inputs,
    outputs,
    options,
} = {}) {


    if (typeof name !== 'string') {
        throw new Error(`talibIndicator: Parameter name must be a string, is ${JSON.stringify(name)}`);
    }
    if (typeof inputs !== 'object' || inputs === null) {
        throw new Error(`talibIndicator: Parameter inputs must be an object, is ${JSON.stringify(inputs)}`);
    }
    if (typeof options !== 'object' || options === null) {
        throw new Error(`talibIndicator: Parameter options must be an object, is ${JSON.stringify(options)}`);
    }
    if (typeof outputs !== 'object' || outputs === null) {
        throw new Error(`talibIndicator: Parameter outputs must be an object, is ${JSON.stringify(outputs)}`);
    }


    // We must return a function as talibIndicator will be called from addIndicator with the
    // current data
    return async(data) => {

        const start = performance.now();

        const dataAsRows = convertColsToRows(
            data.timeSeries,
            data.instrumentKey,
            Object.values(inputs),
        );

        debug('Add talib indicator to %o', data.instruments);

        const indicators = new Map();
        for await (const [instrumentName, instrumentData] of dataAsRows) {

            // Convert dataAsRows from map and original row names to object and talib row names
            const dataForTalib = Object.entries(inputs)
                .reduce((prev, [talibRowName, originalRowName]) => ({
                    ...prev,
                    [talibRowName]: instrumentData.get(originalRowName),
                }), {});

            // Get startIndex and endIndex from data
            const indexes = generateIndexesFromData(dataForTalib);

            const talibOptions = {
                name,
                ...indexes,
                ...dataForTalib,
                // make sure options is last so that the user can overwrite anything above,
                // especially startIdx
                ...options,
            };
            debug('Options for talib are %o', talibOptions);
            const indicatorData = await executeTalibIndicator(talibOptions);

            // addRowsToTimeSeries expects a map; therefore we convert indicatorData to a Map
            // and convert the column names from their talib to the official name
            const reformattedIndicatorData = new Map(Object.entries(indicatorData)
                .map(([talibRowName, values]) => [outputs[talibRowName], values]));

            indicators.set(instrumentName, reformattedIndicatorData);

        }

        return addRowsToTimeSeries(indicators, data.timeSeries, data.instrumentKey);

    };

}
