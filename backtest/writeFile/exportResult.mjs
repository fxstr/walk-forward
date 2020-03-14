import logger from '../logger/logger.mjs';
import getTotalCapital from '../trade/getTotalCapital.mjs';

const { debug } = logger('WalkForward:exportResult');

/**
 * Exports timeSeries.result, i.e. the outcome of a trade with the positions and values over time,
 * into Highstock format
 */
export default () => (data) => {

    debug('Result is %o', data.result);

    const panels = [
        // First panel: Capital with cash and positionValue for every single instrument
        {
            height: '70%',
            id: 'capital',

        },
        // Second panel: Position size over time
        {
            top: '70%',
            height: '30%',
            id: 'positions',
        },
    ];

    const capital = getTotalCapital(data.result);

    // Create one entry for every instrument. Even if it does not have have a position, we want
    // it its position value be 0.
    const positionValueSeries = Array
        .from(data.instruments)
        .map(instrument => ({
            yAxis: 'capital',
            type: 'area',
            name: instrument,
            fillOpacity: 1,
            data: data.result.map(entry => [
                entry.date,
                (entry.positions.find(position => position.instrument === instrument
                    && position.type === 'close') || { value: 0 }).value,
            ]),
            // https://api.highcharts.com/highcharts/series.line.stack
            stack: 'capital',
        }));

    // Print capital line on top of cash/positions
    const capitalSeries = {
        data: capital,
        name: 'capital',
        type: 'line',
        yAxis: 'capital',
    };

    const cashSeries = {
        data: data.result.map(item => [item.date, item.cash]),
        name: 'cash',
        type: 'area',
        yAxis: 'capital',
        fillOpacity: 1,
        stack: 'capital',
    };

    const positionSizes = Array
        .from(data.instruments)
        .map(instrument => ({
            yAxis: 'positions',
            type: 'area',
            fillOpacity: 1,
            stack: 'positions',
            name: instrument,
            data: data.result.map(entry => [
                entry.date,
                entry.positions.find(pos => pos.instrument === instrument) ?
                    entry.positions.find(pos => pos.instrument === instrument).size : 0,
            ]),
        }));

    return JSON.stringify({
        title: 'Result',
        yAxis: panels,
        // Cash must be at the end if the positionValues should be stacked on/above it
        series: [...positionValueSeries, cashSeries, ...positionSizes, capitalSeries],
        plotOptions: {
            area: {
                stacking: 'normal',
            },
        },
    }, null, 2);

};
