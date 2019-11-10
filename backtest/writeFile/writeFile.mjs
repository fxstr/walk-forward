import { writeFileSync } from 'fs';
import logger from '../logger/logger.mjs';
// import convertMapsToObjects from '../dataHelpers/convertMapsToObjects.mjs';

const { debug } = logger('WalkForward:run');

export default (data, path, getDataFunction) => {
    const dataToWrite = getDataFunction(data);
    // const convertedData = convertMapsToObjects(dataToWrite);
    // We cannot nicely format JSON as this will break EventSource
    writeFileSync(path, JSON.stringify(dataToWrite));
    debug('File %s written', path);
    return data;
};
