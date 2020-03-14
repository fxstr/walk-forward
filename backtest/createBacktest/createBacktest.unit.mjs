import test from 'ava';
import createBacktest from './createBacktest.mjs';

test('provides all methods', (t) => {
    const strategy = createBacktest();
    const methods = [
        'useData',
        'addIndicator',
        'addViewOptions',
        'writeFile',
        'run',
        'configure',
        'trade',
        'select',
        'weight',
        'rebalance',
        'truncate',
        'do',
        'calculatePerformance',
    ];

    // Necessary methods
    methods.forEach((method) => {
        if (!Object.prototype.hasOwnProperty.call(strategy, method)) {
            t.fail(`Method ${method} not found in createBacktest`);
        }
    });

    // Unexpected methods
    Object.keys(strategy).forEach((method) => {
        if (!methods.includes(method)) {
            t.fail(`Method ${method} is unexpected on createBacktest`);
        }
    });

    t.pass();

});
