import test from 'ava';
import convertMapsToObjects from './convertMapsToObjects.mjs';

function setupData() {
    // We need to test objects, arrays, primitives and maps
    const data = {
        key1: 'value1',
        key2: [
            new Map([
                ['arrayKey', [1, 2, 3]],
                [123, { isObject: true }],
            ]),
        ],
    };
    return { data };
}

test('converts structures correctly', (t) => {
    const { data } = setupData();
    const converted = convertMapsToObjects(data);
    t.deepEqual(converted, {
        key1: 'value1',
        key2: [
            {
                arrayKey: [1, 2, 3],
                123: { isObject: true },
            },
        ],
    });
});

test('throws on invalid Map keys', (t) => {
    const invalidKeys = [[], new Map(), {}];
    invalidKeys.forEach((key) => {
        t.throws(() => convertMapsToObjects(new Map([[key, 'value']])), /Cannot convert Map/);
    });
});
