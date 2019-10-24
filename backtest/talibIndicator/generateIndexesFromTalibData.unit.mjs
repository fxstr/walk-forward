import test from 'ava';
import generateIndexesFromTalibData from './generateIndexesFromTalibData.mjs';

test('generates correct indexes', (t) => {
    const indexes = generateIndexesFromTalibData({
        // Less values: Use as endIdx
        row2: [undefined, 3, 2, 1],
        // More undefineds: Use as startIdx
        row1: [undefined, undefined, 4, 3, 2],
    });
    t.deepEqual(indexes, { startIdx: 0, endIdx: 3 });
});
