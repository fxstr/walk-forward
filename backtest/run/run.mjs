import logger from '../logger/logger.mjs';

const { debug } = logger('WalkForward:run');

export default stack => async() => {

    // At the beginning, data is an empty Map; it can be overwritten by using data sources. Make
    // sure readFromCSV (or any other source) also returns a map.
    let data = new Map();

    // Just go through all methods and execute them serially
    for await (const methodData of stack) {
        const [stackFunction, ...parameters] = methodData;
        debug('Call function %o', stackFunction);
        data = await stackFunction(data, ...parameters);
    }

    debug('All functions were run');
    return data;

};
