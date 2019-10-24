/**
 * Converts data for a certain instrument into a format that can be directly read by HighStock
 */
import getSortedDataForInstrument from '../dataHelpers/getSortedDataForInstrument.mjs';
import logger from '../logger/logger.mjs';
import createOHLCOutput from './createOHLCOutput.mjs';
import createPanels from './createPanels.mjs';
import createHighstockSeries from './createHighstockSeries.mjs';

const { debug } = logger('WalkForward:convertInstrumentToHighstock');

export default function convertInstrumentToHighstock(instrument) {

    return function(data) {

        const notInstrumentKey = ([key]) => key !== data.instrumentKey;
        const instrumentData = getSortedDataForInstrument(data, instrument)
            // Remove field instrument from data; to do so, first clone data, then remove the field
            // from the clone. This reduces the params passed to createHighstockSeries.
            .map(entry => new Map(Array.from(entry.entries()).filter(notInstrumentKey)));

        const result = {
            series: [],
            yAxis: [],
        };


        // OHLC
        const { spareFields, series: ohlcSeries } = createOHLCOutput(instrumentData);
        if (ohlcSeries) result.series.push(ohlcSeries);


        // Other Series
        const seriesViewOptions = data.viewOptions && data.viewOptions.series;
        const otherSeries = createHighstockSeries(instrumentData, spareFields, seriesViewOptions);
        result.series = [...result.series, ...otherSeries];


        // Create panels (yAxis)
        const allPanels = new Map([
            ['main', { height: 1 }],
            ...(data.viewOptions.panels || new Map()),
        ]);
        result.yAxis = createPanels(allPanels);

        return result;

    };

}

