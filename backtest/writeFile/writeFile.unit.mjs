import test from 'ava';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import writeFile from './writeFile.mjs';

const workingDirectory = dirname(fileURLToPath(import.meta.url));

test('writes file', (t) => {
    const filePath = join(workingDirectory, 'test-data/test-result.json');
    writeFile({ allFine: true }, filePath, value => value);
    const fileContent = JSON.parse(readFileSync(filePath));
    // Map has been converted to an Object
    t.deepEqual(fileContent, { allFine: true });
});
