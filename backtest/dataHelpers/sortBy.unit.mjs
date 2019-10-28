import test from 'ava';
import sortBy from './sortBy.mjs';

const setupData = () => [{
    time: 3,
}, {
    time: 0,
    name: 'b',
}, {
    time: 0,
    name: 'a',
}, {
    time: -2,
}];

test('sorts as expected', (t) => {
    const data = setupData();
    t.deepEqual(data.sort(sortBy('time', 'name')), setupData().reverse());
});
