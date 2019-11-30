import test from 'ava';
import truncate from './truncate.mjs';
import createTestData from '../testData/createTestData.mjs';

const getTime = day => new Date(2019, 0, day, 0, 0, 0).getTime();

test('works with from and to', (t) => {
    const { data } = createTestData();
    const newData = truncate(data, getTime(3), getTime(6));
    const expectation = [getTime(3), getTime(4), getTime(4), getTime(6)];
    t.deepEqual(newData.timeSeries.map(entry => entry.get('date')), expectation);
    t.deepEqual(newData.instructions.map(({ date }) => date), expectation);
});

test('works without anything', (t) => {
    const { data } = createTestData();
    const newData = truncate(data);
    const expectation = data.timeSeries.map(entry => entry.get('date'));
    t.deepEqual(newData.timeSeries.map(entry => entry.get('date')), expectation);
    t.deepEqual(newData.instructions.map(({ date }) => date), expectation);
});

test('works with from only', (t) => {
    const { data } = createTestData();
    const newData = truncate(data, getTime(4));
    const expectation = [getTime(4), getTime(4), getTime(6), getTime(7)];
    t.deepEqual(newData.timeSeries.map(entry => entry.get('date')), expectation);
    t.deepEqual(newData.instructions.map(({ date }) => date), expectation);
});

test('works with to only', (t) => {
    const { data } = createTestData();
    const newData = truncate(data, undefined, getTime(3));
    const expectation = [getTime(1), getTime(2), getTime(2), getTime(3)];
    t.deepEqual(newData.timeSeries.map(entry => entry.get('date')), expectation);
    t.deepEqual(newData.instructions.map(({ date }) => date), expectation);
});
