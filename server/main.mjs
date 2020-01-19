import { exec } from 'child_process';
import { exit, argv } from 'process';
import setupServer from './server.mjs';

/**
 * Starts watcher and server. Call it with
 *
 *      node --experimental-modules main.js file=./myFileToWatch.mjs
 *
 */

// Get file argument from argv, check validity
if (argv.length < 3) {
    console.error('main.mjs: Pass one argument that contains path to file you want to watch.');
    exit();
}
const [,, fileArgument] = argv;

try {
    const filePath = fileArgument;
    console.log(`main.js: Watching file ${filePath}`);
    setupServer(filePath);
    exec('open -a "Google Chrome" http://localhost:8000');
    console.log('main.js: Ready, file is %s', filePath);
} catch (err) {
    console.error('main.mjs: %o', err);
}
