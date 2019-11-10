import createDefaultConfiguration from '../useData/createDefaultConfiguration.mjs';

/**
 * Returns data as created by useData
 */
export default function createTestData() {

    const scaffold = [
        // Instrument, 2019-01-xx, open, close
        ['aapl', 1, 13.2, 14.1],
        ['aapl', 2, 13.9, 13.1],
        // Make sure both instruments don't start at the same time
        ['amzn', 2, 22.2, 22.1],
        ['aapl', 4, 14.1, 14.3],
        ['aapl', 7, 13.4, 13.1],
        ['aapl', 6, 13.4, 13.6],
        ['amzn', 3, 21.8, 22.0],
        ['amzn', 4, 21.6, 22.3],
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
        instructions: scaffold.map(entry => ({
            date: new Date(2019, 0, entry[1], 0, 0, 0).getTime(),
            instrument: entry[0],
            selected: 0,
            weight: 1,
            trade: 1,
        })),
        viewOptions: {},
        configuration: createDefaultConfiguration(),
    };

    return { instrumentKey, data };

}
