import test from 'ava';
import { addEventListener, emitEvent } from './observer.js';

test('emitEvent and addEventListener allow for currying', (t) => {
    t.is(typeof addEventListener(new Map()), 'function');
    t.is(typeof emitEvent(new Map()), 'function');
});

test('addEventListener returns a new map, doesn\'t change original data', (t) => {
    const nullMap = new Map();

    // Create new map, nullMap should still be empty
    const firstMap = addEventListener(nullMap)('change', () => {});
    t.deepEqual(nullMap, new Map());

    // Add another change handler to newly created map – original should not change (see if arrays
    // don't change)
    addEventListener(firstMap)('change', () => {});
    t.is(firstMap.get('change').length, 1);
});


test('emits correct arguments', (t) => {
    const handled = {};
    const eventMap = addEventListener(new Map())('change', (...args) => { handled.change = args; });
    emitEvent(eventMap)('change', 1, 2, 3);
    t.deepEqual(handled.change, [1, 2, 3]);
});


test('emits for multiple handlers', (t) => {
    const handled = [];
    let eventMap = addEventListener(new Map())('change', (...args) => handled.push(args));
    eventMap = addEventListener(eventMap)('change', (...args) => handled.push(args));
    emitEvent(eventMap)('change', 1);
    t.deepEqual(handled, [[1], [1]]);
});
