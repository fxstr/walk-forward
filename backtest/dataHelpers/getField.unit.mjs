import test from 'ava';
import getField from './getField.mjs';

test('fails on invalid structure', (t) => {
    t.throws(() => getField('string', 'name'), /not a Map nor an object/);
    t.throws(() => getField(null, 'name'), /not a Map nor an object/);
});

test('returns fields', (t) => {
    t.is(getField({ a: 9, b: 2 }, 'b'), 2);
    t.is(getField([1, 2, 3], 2), 3);
    t.is(getField(new Map([['a', 9], ['b', 2]]), 'b'), 2);
});
