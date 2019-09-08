import { watch, readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const promisifiedExec = promisify(exec);

async function executeHaloAroundFile(filePath) {
    const command = `node --experimental-modules halo.mjs file=${filePath}`;
    const { err, stdout, stderr } = await promisifiedExec(command);
    if (err) {
        console.error(`setupWatcher.mjs: Executing file ${filePath} failed:`, err, stderr);
    } else {
        console.log(`setupWatcher: File ${filePath} successfully executed: %o`, stdout);
    }
};


/**
 * Watches a file. Whenever it changes, executes a script (halo.mjs) that executes the file's
 * content and writes the default export (as JSON) to a file.
 * Seems this is the easiest and simplest way execute a script and serve its result in real-time:
 * - Node's VM has issues with imports in executed files
 * - If we'd store a JSON file from within the main js file (fs.writeFile()), we have to execute it
 *   first
 */
export default function setupWatcher(filePath) {
    watch(filePath, (changeType, filename) => {
        console.log(`server.mjs: ${filename} changed.`);
        executeHaloAroundFile(filePath);
    });
    executeHaloAroundFile(filePath);
}