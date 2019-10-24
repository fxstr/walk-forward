import { watch, unwatchFile, readFileSync } from 'fs';
import express from 'express';



/**
 * Creates and returns a handler function (for every request that is made to /result); this ensures
 * that we remove the correct function when the request ends.
 * @param  {String} filePath    Path to the file that we watch and read
 * @param  {Response} response  Express response object that we write our data to
 */
function createFileChangeHandler(filePath, response) {
    return () => {
        console.log(`server.mjs: ${filePath} changed.`);
        const content = readFileSync(filePath, 'utf8');
        console.log(content);
        // Start every line with data:
        // As \n\n starts a new message, convert more than one \n to to just one \n
        // This might become problematic; if it does, we should maybe use WebSockets
        const newLineContent = content.split(/\n+/).map(line => `data: ${line}`).join('\n');
        response.write(`${newLineContent}\n\n`);
        console.log('server.mjs: Content sent after change.');
    };
}



/**
 * - Serves content from static directory
 * - Watches result.json file and sends Server Sent Events every time the file changes and on the
 *   first request to /result
 */
export default function setupServer(fileToWatchPath) {

    const app = express();

    app.get('/result', (request, response) => {
        response.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        });
        response.write('\n');
        // Create a new handler function to remove correct instance of it when a client disconnects
        const handleFileChange = createFileChangeHandler(fileToWatchPath, response);
        watch(fileToWatchPath, handleFileChange);
        // When request closes, remove current handleFileChange function
        request.on('close', () => unwatchFile(fileToWatchPath, handleFileChange));
        // Send data whenever connection opens
        handleFileChange();
    });

    app.use(express.static('www'));
    app.listen(8000);

}

