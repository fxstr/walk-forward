import debug from 'debug';
import tableExport from 'table';
import { getConfig } from './environment.mjs';
import getDebugLevels from './getDebugLevels.mjs';
import debugLevels from './debugLevels.mjs';

const { table } = tableExport;

/**
 * Does the acutal logging, is the function returned when calling debug(namespace).
 * @param  {String} logLevel Log level
 * @param  {function} logFunction
 * @param  {Array} originalParams
 */
function doLog(logLevel, logFunction, ...originalParams) {
    // Get current logLevels
    const logLevels = getDebugLevels(getConfig('DEBUG_LEVELS'));
    if (!logLevels.includes(logLevel)) return;
    logFunction(...originalParams);
}


/**
 * Add date format
 * @param {number} timestamp
 * @return {string}
 */
const pad = nr => (nr < 10 ? `0${nr}` : `${nr}`);
debug.formatters.t = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/**
 * Add tabular format.
 * @param  {object}  options
 * @param  {array[]}  options.data  Array of rows, see https://www.npmjs.com/package/table
 * @return {string}
 */
debug.formatters.T = ({ data = [], config = {} } = {}) => (
    // Surround with \n to make sure first/last line does not break badly
    `\n${table(data, config)}\n`
);

/**
 * Add money format (2 digits after comma)
 * @param {number} number
 * @return {string}
 */
debug.formatters.m = number => number.toFixed(2);


/**
 * Main export: Exports an object with different log levels as keys, each containing the
 * corresponding log function.
 *
 * Use as follows:
 *
 * import logger from 'logger';
 * const log = logger('MyNamespace');
 * log.info('Info log level message');
 *
 * @param {String}      namespace
 * @return {Object}     Object with levels as keys and corresponding log functions as values, e.g.
 *                      { info: () => doInfoLogFunction }
 */
export default function(namespace) {
    // Create new debugger (from npm debug module)
    const logger = debug(namespace);
    const returnObject = {};
    Object.keys(debugLevels).forEach((logLevel) => {
        returnObject[logLevel] = (...params) => doLog(logLevel, logger, ...params);
    });
    return returnObject;
}
