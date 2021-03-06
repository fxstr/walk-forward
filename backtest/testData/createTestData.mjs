import createDefaultConfiguration from '../configure/createDefaultConfiguration.mjs';
import createDefaultInstructions from '../useData/createDefaultInstructions.mjs';

/**
 * Returns data as created by useData
 */
export default function createTestData() {

    // Sorted chronologically and then alphabetically
    const scaffold = [
        // Instrument, 2019-01-xx, open, close
        ['aapl', 1, 13.2, 14.1],
        ['aapl', 2, 13.9, 13.1],
        // Make sure both instruments don't start at the same time
        ['amzn', 2, 22.2, 22.1],
        // Make sure there are dates with no data for one instrument
        ['amzn', 3, 21.8, 22.0],
        ['aapl', 4, 14.1, 14.3],
        ['amzn', 4, 21.6, 22.3],
        ['aapl', 6, 13.4, 13.6],
        ['aapl', 7, 13.4, 13.1],
    ];

    const instrumentKey = Symbol('instrumentKey');
    const data = {
        instrumentKey,
        instruments: new Set(scaffold.map(entry => entry[0])),
        timeSeries: scaffold.map(entry => new Map([
            ['date', new Date(2019, 0, entry[1], 0, 0, 0).getTime()],
            ['open', entry[2]],
            ['close', entry[3]],
            [instrumentKey, entry[0]],
        ])),
        instructions: scaffold.map(entry => createDefaultInstructions(
            entry[0],
            new Date(2019, 0, entry[1], 0, 0, 0).getTime(),
        )),
        viewOptions: {},
        configuration: createDefaultConfiguration(),
    };

    return { instrumentKey, data };

}
