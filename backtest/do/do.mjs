import { performance } from 'perf_hooks';
import spinner from '../spinner/spinner.mjs';


/**
 * Executes any function provided by the user.
 */
export default (data, doFunction) => {

    const output = spinner('Executing user function …');
    const startTime = performance.now();

    const result = doFunction(data);
    if (result === null || typeof result !== 'object' || result.constructor !== Object) {
        throw new Error(`do: Function provided must return an object which has the same structure as the data provided as an argument; you returned ${result} instead.`);
    }

    const endTime = performance.now();
    output.succeed(`Executed user function in ${Math.round(endTime - startTime)} ms`);

    return result;

};
