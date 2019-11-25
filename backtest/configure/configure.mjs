import { performance } from 'perf_hooks';
import spinner from '../spinner/spinner.mjs';

export default (data, config) => {

    const startTime = performance.now();
    const output = spinner('Configuring …');

    // Is config an object?
    if (!config || typeof config !== 'object' || config.constructor !== Object) {
        throw new Error(`configure: The configuration you pass must be an object, is ${JSON.stringify(config)}.`);
    }

    // Does config contain invalid keys?
    const validKeys = Object.keys(data.configuration);
    const invalidKeys = Object.keys(config).filter(newKey => !validKeys.includes(newKey));
    if (invalidKeys.length) {
        throw new Error(`configure: You passed an invalid configuration option(s) ${invalidKeys.join(', ')}`);
    }

    const mergedData = {
        ...data,
        configuration: { ...data.configuration, ...config },
    };

    const endTime = performance.now();
    output.succeed(`Configuration done in ${Math.round(endTime - startTime)} ms`);
    return mergedData;

};
