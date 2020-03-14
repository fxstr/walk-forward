import test from 'ava';
import createPosition from './createPosition.mjs';

test('creates position', (t) => {
    t.deepEqual(createPosition('test', -15, 12, 6, 0.5), {
        instrument: 'test',
        size: -15,
        created: {
            price: 12,
            barsSince: 0,
            marginPrice: 6,
            pointValue: 0.5,
        },
        value: 15 * 6 * 0.5,
        type: 'open',
    });
});

test('uses defaults', (t) => {
    t.deepEqual(createPosition('test', 15, 12), {
        instrument: 'test',
        size: 15,
        created: {
            price: 12,
            barsSince: 0,
            marginPrice: 12,
            pointValue: 1,
        },
        value: 15 * 12,
        type: 'open',
    });
});
