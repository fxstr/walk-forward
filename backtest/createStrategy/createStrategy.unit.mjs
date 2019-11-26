import test from 'ava';
import createStrategy from './createStrategy.mjs';

test('provides all methods', (t) => {
    const strategy = createStrategy();
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
        'rest',
    ];

    methods.forEach((method) => {
        if (!Object.prototype.hasOwnProperty.call(strategy, method)) {
            t.fail(`Method ${method} not found in createStrategy`);
        }
    });

    Object.keys(strategy).forEach((method) => {
        if (!methods.includes(method)) {
            t.fail(`Method ${method} is unexpected on createStrategy`);
        }
    });

    t.pass();

});
