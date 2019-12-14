import test from 'ava';
import createPosition from './createPosition.mjs';

test('creates position', (t) => {
    t.deepEqual(createPosition('test', 15, 12, 123, 6), {
        instrument: 'test',
        size: 15,
        openPrice: 12,
        openDate: 123,
        marginPrice: 6,
    });
});
