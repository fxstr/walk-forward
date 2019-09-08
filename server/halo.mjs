/**
 * Creates a «halo» around the main js file. Executes it whenever it changes and stores default
 * export in a file 'result.json'
 * Don't throw errors in here as this script will be executed directly within the shell.
 *
 * To debug, execute this file directly.
 */
import { argv } from 'process';
import { writeFileSync } from 'fs';

console.log(`halo.mjs: Called with ${argv.length} arguments.`);

if (argv.length < 3) {
    console.log('halo.mjs: Pass one argument that contains path to file you want to read');
}
const [,, fileArgument] = argv;
if (!fileArgument.startsWith('file=')) {
    console.log('halo.mjs: Pass one argument that has the following format: "file=[fileName.ext]".');
}

const filePath = fileArgument.substr(5);
console.log('halo.mjs: Execute file %s', filePath);

// From here on, content is async and won't be displayed any more (because setupWatchermjs only
// reads and displays what halo.mjs puts on console *synchronously*)
import (filePath)
    .then((result) => {
        writeFileSync('result.json', JSON.stringify(result));
        console.log('halo.mjs: File written');
    })
    .catch((err) => {
        writeFileSync('result.json', `${err.message}\n\n${err.stack}`);
        console.log('halo.mjs: Error file written');
    });
