import logger from '../logger/logger.mjs';
import runStack from './runStack.mjs';

const { debug } = logger('WalkForward:run');

export default async(stack) => {

    debug('Run stack with %d entries', stack.length);

    // At the beginning, data is an empty Map; it can be overwritten by using data sources. Make
    // sure readFromCSV (or any other source) also returns a map.
    const result = await runStack(stack, new Map());

    debug('All functions were run.');
    return result;

};
