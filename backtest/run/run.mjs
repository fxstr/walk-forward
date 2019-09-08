import logger from '../logger/logger.mjs';

const { debug } = logger('WalkForward:run');

export default stack => async() => {

    // At the beginning, data is an empty map; it can be overwritten by using data sources.
    let data = new Map();

    // Just go through all methods and execute them serially
    for await (const methodData of stack) {
        const [stackFunction, ...parameters] = methodData;
        debug(
            'Call function %o with data %o and arguments %o',
            stackFunction,
            data,
            ...parameters,
        );
        data = await stackFunction(data, ...parameters);
    }

    debug('All functions were run, data is %o', data);
    return data;

};
