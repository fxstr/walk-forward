import { performance } from 'perf_hooks';
import { readFileSync } from 'fs';
import { parse as parsePath } from 'path';
import glob from 'glob';
// Test file throws error if we're using 'csv-parse/lib/sync.js': module cannot be found.
import parseCSV from '../../node_modules/csv-parse/lib/sync.js';
import logger from '../logger/logger.mjs';
import transformObject from '../dataHelpers/transformObject.mjs';
import spinner from '../spinner/spinner.mjs';

const { debug } = logger('WalkForward:readFromCSV');

/**
 * Reads instrument data from (multiple) CSVs, returns re-formatted data.
 *
 * @param {String} globPattern              Glob pattern of CSV files that should be read and
 *                                          parsed.
 * @param {Function} [transformFunction]   Function that transforms every row's entries. Is called
 *                                          with an array [key, value] and must return a
 *                                          corresponding array [transformedKey, transformedValue].
 *                                          Example (converts date row to a timeStamp and every
 *                                          other row to a Number):
 *                                          ([key, value]) => {
 *                                              if (key === 'date') {
 *                                                  return ['date', new Date(value).getTime()];
 *                                              }
 *                                              else return [key, Number(value)]
 *                                          }
 *
 * @return {Object}                         CSV data in the form of
 *                                          {
 *                                              instrument1Name: {
 *                                                  date: 132495124,
 *                                                  open: 12.5,
 *                                              }
 *                                          }

 */
export default (
    globPattern,
    transformFunction = value => value,
    fileNameTransformFunction = value => value,
) => {

    const startTime = performance.now();
    const files = glob.sync(globPattern);
    const output = spinner('Load CSV files …');

    debug('Read files %o', files);
    if (files.length === 0) {
        console.warn('readFromCSV: There are no files to be read');
    }

    // Options for parse-csv
    const parseOptions = {
        columns: true,
    };

    // Flatten data into a single array of data sets; add column instrument
    const fileContent = files.reduce((prev, file) => {

        output.setText(`Loading ${file} …`);

        const content = readFileSync(file);
        const parsedData = parseCSV(content, parseOptions);
        const fileName = parsePath(file).name;
        debug(
            'Read and parsed \'%s\', has %d rows and columns %o',
            fileName,
            parsedData.length,
            parsedData.length ? Object.keys(parsedData[0]) : undefined,
        );

        // Apply transformFunction to every row (object) of CSV
        const transformedData = parsedData
            .map(entry => transformObject(entry, transformFunction))
            .map(entry => new Map(Object.entries(entry)));

        const result = new Map(prev);
        const instrumentName = fileNameTransformFunction(fileName);
        result.set(instrumentName, transformedData);
        return result;

    }, new Map());

    const duration = Math.round(performance.now() - startTime);
    output.succeed(`${files.length} CSV files loaded in ${duration} ms`);

    return fileContent;

};
