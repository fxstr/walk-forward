import test from 'ava';
import walkStructure from './walkStructure.mjs';


test('primitive uses correct arguments', (t) => {
    const primitiveArgs = [];
    walkStructure(5, (...args) => primitiveArgs.push(args) && args[0]);
    t.is(primitiveArgs.length, 1);
    t.deepEqual(primitiveArgs[0], [5, undefined, undefined]);
});


// Set
test('Set uses correct arguments', (t) => {
    const setArgs = [];
    const set = new Set(['a', 'b']);
    walkStructure(set, (...args) => setArgs.push(args) && args[0]);
    t.is(setArgs.length, 3);
    t.deepEqual(setArgs[0], [set, undefined, undefined]);
    t.deepEqual(setArgs[1], ['a', set, undefined]);
    t.deepEqual(setArgs[2], ['b', set, undefined]);
});

test('transforms whole set', (t) => {
    const data = new Set(['a', 'b']);
    const result = walkStructure(data, () => 'a');
    t.deepEqual(result, 'a');
    // Does not modify original
    t.deepEqual(data, new Set(['a', 'b']));
});

test('transforms set content', (t) => {
    const data = new Set([1, 2]);
    const result = walkStructure(data, content => (content instanceof Set ? content : content + 1));
    t.deepEqual(result, new Set([2, 3]));
    // Does not modify original
    t.deepEqual(data, new Set([1, 2]));
});


// Object
test('object uses correct arguments', (t) => {
    const objectArgs = [];
    const object = { key: 'value', foo: 'bar' };
    walkStructure(object, (...args) => objectArgs.push(args) && args[0]);
    t.is(objectArgs.length, 5);
    t.deepEqual(objectArgs[0], [object, undefined, undefined]);
    t.deepEqual(objectArgs[1], ['key', object, undefined]);
    t.deepEqual(objectArgs[2], ['value', object, 'key']);
});

test('transforms whole object', (t) => {
    const data = { first: 1, second: 2 };
    const result = walkStructure(data, () => 5);
    t.is(result, 5);
});

test('transforms object keys and properties', (t) => {
    const data = { first: 1, second: 2 };
    const result = walkStructure(data, (value, parent, key) => {
        // Value: subtract 3
        if (parent && key) return value - 3;
        // Key: Uppercase
        if (parent && !key) return value[0].toUpperCase() + value.substring(1);
        // Whole object: Don't modify
        return value;
    });
    t.deepEqual(result, { First: -2, Second: -1 });
    // Does not modify original
    t.deepEqual(data, { first: 1, second: 2 });
});


// Map
test('Map uses correct arguments', (t) => {
    const mapArgs = [];
    const map = new Map([['key', 'value'], ['foo', 'bar']]);
    walkStructure(map, (...args) => mapArgs.push(args) && args[0]);
    t.is(mapArgs.length, 5);
    t.deepEqual(mapArgs[0], [map, undefined, undefined]);
    t.deepEqual(mapArgs[1], ['key', map, undefined]);
    t.deepEqual(mapArgs[2], ['value', map, 'key']);
});

test('transforms map keys and properties', (t) => {
    const data = new Map([['first', 1], ['second', 2]]);
    const result = walkStructure(data, (value, parent, key) => {
        // Value: subtract 3
        if (parent && key) return value - 3;
        // Key: Uppercase
        if (parent && !key) return value[0].toUpperCase() + value.substring(1);
        // Whole object: Don't modify
        return value;
    });
    t.deepEqual(result, new Map([['First', -2], ['Second', -1]]));
    // Original was not modified
    t.deepEqual(data, new Map([['first', 1], ['second', 2]]));
});


// Array
test('array uses correct arguments', (t) => {
    const arrayArgs = [];
    walkStructure([1, 2], (...args) => arrayArgs.push(args) && args[0]);
    t.is(arrayArgs.length, 3);
    t.deepEqual(arrayArgs[0], [[1, 2], undefined, undefined]);
    t.deepEqual(arrayArgs[1], [1, [1, 2], 0]);
});

test('transforms whole array', (t) => {
    const data = [6, 5];
    const result = walkStructure(data, () => 'a');
    t.deepEqual(result, 'a');
    // Original was not motidifed
    t.deepEqual(data, [6, 5]);
});

test('transforms array content', (t) => {
    const data = [6, 5, 4, 3];
    const result = walkStructure(data, (value, parent, key) => (
        typeof value === 'number' ? value - key : value
    ));
    t.deepEqual(result, [6, 4, 2, 0]);
    // Original was not motidifed
    t.deepEqual(data, [6, 5, 4, 3]);
});


// Identity
test('transformFunction defaults to identity', (t) => {
    const data = {
        instruments: new Map([
            ['aapl', { close: 3 }],
            ['amzn', { close: 4 }],
        ]),
        set: new Set(['a', 'b']),
        settings: ['first'],
    };
    const result = walkStructure(data);
    t.deepEqual(result, {
        instruments: new Map([
            ['aapl', { close: 3 }],
            ['amzn', { close: 4 }],
        ]),
        set: new Set(['a', 'b']),
        settings: ['first'],
    });
});

