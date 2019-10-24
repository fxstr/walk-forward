import test from 'ava';
import transformObject from './transformObject.mjs';

test('transforms data', (t) => {
    const data = {
        Time: new Date(2019, 0, 1, 0, 0, 0),
        Open: '15',
        Close: '15.5',
    };
    const transform = ([key, value]) => (
        key === 'Time' ?
            ['date', value.getTime()] :
            [key.toLowerCase(), Number(value)]
    );
    const transformed = transformObject(data, transform);
    t.deepEqual(transformed, {
        date: 1546297200000,
        open: 15,
        close: 15.5,
    });
});
