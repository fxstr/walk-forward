import { writeFileSync } from 'fs';
import logger from '../logger/logger.mjs';
import convertMapsToObjects from './convertMapsToObjects.mjs';

const { debug } = logger('WalkForward:run');

export default (data, outputDirectory, getDataFunction) => {
    const dataToWrite = getDataFunction(data);
    const convertedData = convertMapsToObjects(dataToWrite);
    writeFileSync(outputDirectory, JSON.stringify(convertedData));
    debug('File %s written', outputDirectory);
    return data;
};
