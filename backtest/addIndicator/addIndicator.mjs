import { performance } from 'perf_hooks';
import logger from '../logger/logger.mjs';
// import walkStructure from '../dataHelpers/walkStructure.mjs';
import spinner from '../spinner/spinner.mjs';

const { debug } = logger('WalkForward:addIndicator');

/**
 * Adds an indicator to data
 * @param  {Object} data                Data structure as created by useData()
 * @param  {Function} indicatorFunction Function that will be called to create the indicators
 * @return {Object}                     Cloned data enriched with new indicator data
 */
export default async(data, indicatorFunction) => {

    const output = spinner('Adding indicator …');
    const startTime = performance.now();

    const indicatorData = await indicatorFunction(data);

    const endTime = performance.now();
    output.succeed(`Added indicator in ${Math.round(endTime - startTime)} ms`);

    return {
        ...data,
        timeSeries: indicatorData,
    };

};
