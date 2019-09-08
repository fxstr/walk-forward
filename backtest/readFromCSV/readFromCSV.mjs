import { readFileSync } from 'fs';
import { parse as parsePath } from 'path';
import glob from 'glob';
// Test file throws error if we're using 'csv-parse/lib/sync.js': module cannot be found.
import parseCSV from '../../node_modules/csv-parse/lib/sync.js';
import logger from '../logger/logger.mjs';
import transformRow from './transformRow.mjs';

const { debug } = logger('WalkForward:readFromCSV');

/**
 * Reads instrument data from CSV, returns updated data in the from of:
 * new Map([[
 *     fileName,
 *     {
 *         // Data for every col, e.g. indicator used, col data derives from, view options …
 *         columns: new Map(),
 *         data: new Map([
 *             timeStamp,
 *             {
 *                 selected: false,
 *                 weight: 1,
 *                 order: 3,
 *                 data: new Map([
 *                     ['open', 5.12],
 *                     ['close', 5.18],
 *                 ]),
 *             },
 *         ]),
 *     },
 * ]])
 *
 * @param {String} globPattern              Glob pattern of CSV files that should be read and
 *                                          parsed.
 * @param {Function} [transformerFunction]  Function that transforms every row's entries. Is called
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
 */
export default (globPattern, transformerFunction) => {

    const files = glob.sync(globPattern);
    debug('Read files %o', files);

    // Options for parse-csv
    const parseOptions = {
        columns: true,
    };

    // Map with an entry for every instrument; key is the instrument's file name (without
    // extension).
    const data = new Map();

    for (const file of files) {
        const content = readFileSync(file);
        const parsedData = parseCSV(content, parseOptions);
        const fileName = parsePath(file).name;
        debug(
            'Read and parsed \'%s\', has %d rows and columns %o',
            fileName,
            parsedData.length,
            parsedData.length ? Object.keys(parsedData[0]) : undefined,
        );

        // parseCSV creates an object from every row; transform data to match our internal data
        // structure (see function docs above).
        const dataAsMap = new Map(parsedData.map(row => transformRow(row, transformerFunction)));
        data.set(fileName, {
            columns: new Map(),
            data: dataAsMap,
        });
    }

    return {
        // Export instrument data as instrument property, as we need a "safe space" for other data
        // (e.g. accounts, positions …)
        instruments: data,
    };

};
