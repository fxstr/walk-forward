import { performance } from 'perf_hooks';
import { writeFileSync } from 'fs';
import logger from '../logger/logger.mjs';
import spinner from '../spinner/spinner.mjs';

const { debug } = logger('WalkForward:run');

export default (data, path, getDataFunction) => {

    const startTime = performance.now();
    const output = spinner(`Writing file ${path} …`);

    debug('Write file to %s.', path, data, getDataFunction);
    debug('Execute getDataFunction for data %o', data);

    const dataToWrite = getDataFunction(data);
    // We cannot nicely format JSON as this will break EventSource in frontend (newline mean a
    // new message)
    writeFileSync(path, JSON.stringify(dataToWrite));

    debug('File %s written.', path);
    const endTime = performance.now();
    output.succeed(`File ${path} written in ${Math.round(endTime - startTime)} ms`);

    return data;

};
