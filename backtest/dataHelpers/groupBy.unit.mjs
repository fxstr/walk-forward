import test from 'ava';
import groupBy from './groupBy.mjs';

test('groups items', (t) => {

    const data = [{
        key: 3,
        value: 2,
    }, {
        key: 4,
        value: 3,
    }, {
        key: 3,
        value: 4,
    }, {
        key: 5,
        value: 5,
    }];

    const result = groupBy(data, ({ key }) => key);
    t.deepEqual(result, [
        [3, [data[0], data[2]]],
        [4, [data[1]]],
        [5, [data[3]]],
    ]);

});

test('works with empty data', (t) => {
    t.deepEqual(groupBy([], () => undefined), []);
});
