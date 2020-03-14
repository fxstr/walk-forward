import test from 'ava';
import createTestResultData from '../testData/createTestResultData.mjs';
import exportPerformance from './exportPerformance.mjs';
import calculatePerformance from './calculatePerformance.mjs';

test('exports performance', (t) => {
    const data = createTestResultData();
    const dataWithPerformance = calculatePerformance(data);
    const result = exportPerformance()(dataWithPerformance);
    const lines = result.split('\n');
    t.is(lines.length, 16);
    t.is(lines[0], 'numberOfPositions,3');
});
