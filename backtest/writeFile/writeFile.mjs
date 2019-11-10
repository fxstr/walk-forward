import { writeFileSync } from 'fs';
import logger from '../logger/logger.mjs';

const { debug } = logger('WalkForward:run');

export default (data, path, getDataFunction) => {

    debug('Write file to %s.', path, data, getDataFunction);

    debug('Execute getDataFunction for data %o', data);
    const dataToWrite = getDataFunction(data);
    // const convertedData = convertMapsToObjects(dataToWrite);
    // We cannot nicely format JSON as this will break EventSource
    writeFileSync(path, JSON.stringify(dataToWrite));
    debug('File %s written.', path);
    return data;
};
