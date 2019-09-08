import debug from 'debug';
import { getConfig } from './environment.mjs';
import getDebugLevels from './getDebugLevels.mjs';
import debugLevels from './debugLevels.mjs';

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
