import test from 'ava';
import createPanels from './createPanels.mjs';

test('handles empty data', (t) => {
    t.deepEqual(createPanels(new Map()), []);
});

test('handles data', (t) => {
    const data = new Map([
        ['panel1', { height: 0.5 }],
        ['panel2', { height: 1, property: true }],
    ]);
    t.deepEqual(createPanels(data), [
        { id: 'panel1', height: '33%', top: '0%' },
        {
            id: 'panel2',
            height: '67%',
            top: '33%',
            property: true,
        },
    ]);
});
