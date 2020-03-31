import test from 'ava';
import createTableDataForLog from './createTableDataForLog.mjs';

const setupData = () => {
    const map1 = new Map([
        ['key1', ['a', 'b']],
        ['key2', ['c', 'd']],
    ]);
    const map2 = new Map([
        ['key1', ['e', 'f']],
        ['key3', ['f', 'g']],
    ]);
    return { map1, map2 };
};

test('merges data', (t) => {

    const { map1, map2 } = setupData();
    const result = createTableDataForLog(map1, map2);
    t.deepEqual(result, [
        ['key1', 'a', 'b', 'e', 'f'],
        ['key2', 'c', 'd', 0, 0],
        ['key3', 0, 0, 'f', 'g'],
    ]);

});

