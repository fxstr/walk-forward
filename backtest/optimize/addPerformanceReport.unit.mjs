import test from 'ava';
import addPerformanceReport from './addPerformanceReport.mjs';

test('adds to performance report', (t) => {
    const one = addPerformanceReport({ performance: 'test1' }, new Map([['test', 2]]));
    const two = addPerformanceReport({ performance: 'test2' }, new Map([['test', 3]]), one);

    t.deepEqual(two, [{
        performance: 'test1',
        parameterSet: new Map([['test', 2]]),
    }, {
        performance: 'test2',
        parameterSet: new Map([['test', 3]]),
    }]);

});
