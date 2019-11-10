// import sort from '../sort/sort.mjs';
import run from '../run/run.mjs';
import useData from '../useData/useData.mjs';
import addIndicator from '../addIndicator/addIndicator.mjs';
import writeFile from '../writeFile/writeFile.mjs';
import addViewOptions from '../addViewOptions/addViewOptions.mjs';
import configure from '../configure/configure.mjs';

/**
 * Returns an object which contains all methods that can be called on a strategy (sort,
 * addIndicator etc.). Creates a stack of the called methods and their arguments in order to be
 * called later.
 * @param  {Array}  stack   Stack with previously added methods and their arguments. Every method
 *                          is an array with [methodFunction, argument1, argument2, …].
 * @return {Object}         Object with keys for all methods that can be called on the stack.
 */
const createStrategy = (stack = []) => ({
    useData: (...params) => createStrategy([...stack, [useData, ...params]]),
    addIndicator: (...params) => createStrategy([...stack, [addIndicator, ...params]]),
    addViewOptions: (...params) => createStrategy([...stack, [addViewOptions, ...params]]),
    // sort: (...params) => createStrategy([...stack, [sort, ...params]]),
    writeFile: (...params) => createStrategy([...stack, [writeFile, ...params]]),
    run: run(stack),
    configure: (...params) => createStrategy([...stack, [configure, ...params]]),
    get: () => stack,
});

export default createStrategy;
