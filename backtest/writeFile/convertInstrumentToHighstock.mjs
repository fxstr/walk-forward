import logger from '../logger/logger.mjs';
import createOHLCOutput from './createOHLCOutput.mjs';
import createPanels from './createPanels.mjs';
import createHighstockSeries from './createHighstockSeries.mjs';
import createResultChart from './createResultChart.mjs';

const { debug } = logger('WalkForward:convertInstrumentToHighstock');

/**
 * Converts data for a certain instrument into a format that can be directly read by HighStock
 * @param {string} instrument      Name of instrument to export
 * @returns {function}             Function that will be called with all data
 */
export default instrumentName => (data) => {

    // Filter function to check whether an entry of timeSeries is not the instrument
    const notInstrumentKey = ([key]) => key !== data.instrumentKey;
    const instrumentData = data.timeSeries
        .filter(entry => entry.get(data.instrumentKey) === instrumentName)
        // Remove field instrument from data; to do so, first clone data, then remove the field
        // from the clone. This reduces the params passed to createHighstockSeries.
        .map(entry => new Map(Array.from(entry.entries()).filter(notInstrumentKey)));

    // There is no data for instrumentName: Name was probably misspelled
    if (!instrumentData.length) {
        throw new Error(`convertInstrumentToHighstock: Instrument ${instrumentName} does not exist; please use any of ${Array.from(data.instruments).join(', ')}.`);
    }

    const result = {
        series: [],
        yAxis: [],
    };

    // OHLC
    const { spareFields, series: ohlcSeries } = createOHLCOutput(instrumentData, instrumentName);
    if (ohlcSeries) result.series.push(ohlcSeries);


    // Other Series
    const seriesViewOptions = data.viewOptions && data.viewOptions.series;
    const otherSeries = createHighstockSeries(instrumentData, spareFields, seriesViewOptions);
    result.series = [...result.series, ...otherSeries];


    // Export result (if it exists): add position size as area and instructions as tooltip
    const { panel: resultPanel, series: resultSeries } = createResultChart(
        data.result,
        data.instructions,
        instrumentName,
    );
    result.series = [...result.series, ...resultSeries];


    // Create panels (yAxis)
    const allPanels = new Map([
        ['main', { height: 1 }],
        ...(data.viewOptions.panels || new Map()),
        ...resultPanel,
    ]);
    result.yAxis = createPanels(allPanels);

    return result;

};

