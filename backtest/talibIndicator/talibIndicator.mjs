import sortBy from '../dataHelpers/sortBy.mjs';
import groupBy from '../dataHelpers/groupBy.mjs';
import executeTalibIndicator from './executeTalibIndicator.mjs';
import createDataForTalib from './createDataForTalib.mjs';
import generateIndexesFromData from './generateIndexesFromTalibData.mjs';
import createDataFromTalib from './createDataFromTalib.mjs';
import logger from '../logger/logger.mjs';

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

        const groupedAndSortedTimeSeries = new Map(groupBy(
            [...data.timeSeries].sort(sortBy('date')),
            item => item.get(data.instrumentKey),
        ));

        let returnValue = [];

        debug('Add talib indicator to %o', data.instruments);

        for await (const instrumentName of data.instruments) {

            const dataForTalib = createDataForTalib(
                groupedAndSortedTimeSeries.get(instrumentName),
                inputs,
            );

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

            // Convert data to format expected by addIndicator
            const returnData = createDataFromTalib(
                indicatorData,
                groupedAndSortedTimeSeries.get(instrumentName).map((entry => entry.get('date'))),
                instrumentName,
                outputs,
            );

            returnValue = [...returnValue, ...returnData];

        }

        return returnValue;

    };

}
