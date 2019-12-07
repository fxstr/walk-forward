import run from '../run/run.mjs';
import useData from '../useData/useData.mjs';
import addIndicator from '../addIndicator/addIndicator.mjs';
import writeFile from '../writeFile/writeFile.mjs';
import addViewOptions from '../addViewOptions/addViewOptions.mjs';
import configure from '../configure/configure.mjs';
import trade from '../trade/trade.mjs';
import select from '../instructions/select.mjs';
import weight from '../instructions/weight.mjs';
import rebalance from '../instructions/rebalance.mjs';
import doFunction from '../do/do.mjs';
import truncate from '../truncate/truncate.mjs';

/**
 * Returns an object which contains all methods that can be called on a strategy (sort,
 * addIndicator etc.). Creates a stack of the called methods and their arguments in order to be
 * called later.
 * @param  {Array}  stack   Stack with previously added methods and their arguments. Every method
 *                          is an array with [methodFunction, argument1, argument2, …].
 * @return {Object}         Object with keys for all methods that can be called on the stack.
 */
const createStrategy = (stack = []) => {

    const methods = [
        ['useData', useData],
        ['addIndicator', addIndicator],
        ['addViewOptions', addViewOptions],
        ['writeFile', writeFile],
        ['configure', configure],
        ['trade', trade],
        ['select', select],
        ['weight', weight],
        ['rebalance', rebalance],
        ['truncate', truncate],
        ['do', doFunction],
    ];

    // Add every method to object and set value to a function that
    // a) adds called method and params to the stack
    // b) returns a new object
    const object = methods.reduce((prev, [methodName, methodFunction]) => ({
        ...prev,
        [methodName]: (...params) => createStrategy([...stack, [methodFunction, ...params]]),
    }), {});

    object.run = capital => run(stack, capital);

    return object;

};

export default createStrategy;
