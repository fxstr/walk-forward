import { performance } from 'perf_hooks';
import sortBy from '../dataHelpers/sortBy.mjs';
import groupBy from '../dataHelpers/groupBy.mjs';
import tradeForDate from './tradeForDate.mjs';
import logger from '../logger/logger.mjs';
import spinner from '../spinner/spinner.mjs';

const { debug } = logger('WalkForward:trade');

/**
 * Executes a trading strategy for every date.
 * @param  {Object} data    Data as generated by useData()
 * @return {Object}         The result of our trades, usually with one entry per bar, with the
 *                          following properties:
 *                          - cash: the amount of money not invested. Array of objects with
 *                            properties date and cash
 *                          - orders: Array of Maps, …
 */
export default (data, capital) => {

    const startTime = performance.now();
    const output = spinner('Start trading …');

    if (typeof capital !== 'number') {
        throw new Error(`trade: Pass parameter capital that is a number; you passed ${capital} instead.`);
    }

    const timeSeriesGroupedByDate = groupBy(
        [...data.timeSeries].sort(sortBy('date', data.instrumentKey)),
        item => item.get('date'),
    );

    const instructionsGroupedByDate = new Map(groupBy(
        [...data.instructions].sort(sortBy('date', 'instrument')),
        item => item.date,
    ));

    // Create positions/orders for every entry in timeSeries
    const tradeResult = timeSeriesGroupedByDate.reduce((
        previous,
        [date, timeSeriesEntries],
        index,
    ) => {

        // Get instructions for current date
        const instructionSet = instructionsGroupedByDate.get(date);

        // Creates a Map.<string, number> from timeSeries where key is the instrument name and
        // value is the price type (e.g. 'open')
        const getPriceType = (series, type) => new Map(series
            .map(entry => [entry.get(data.instrumentKey), entry.get(type)]));

        // Map with key: instrumentName, value: opening/closing price
        const openPrices = getPriceType(timeSeriesEntries, 'open');
        const closePrices = getPriceType(timeSeriesEntries, 'close');

        const previousEntry = previous.slice(-1).pop();

        const result = tradeForDate(
            date,
            openPrices,
            closePrices,
            instructionSet,
            // Configuration
            {
                investedRatio: data.configuration.investedRatio,
                maxRatioPerInstrument: data.configuration.maxRatioPerInstrument,
            },
            // Previous data
            {
                orders: previousEntry.orders,
                positions: previousEntry.positions,
                cash: previousEntry.cash,
                positionValues: previousEntry.positionValues,
            },
        );

        // On first run, previous are the initial values (-1) – don't store them
        if (index === 0) return [result];
        return [...previous, result];

    }, [{
        cash: capital,
        positionValues: new Map(),
        // Orders are executed on open, where they are taken as 'left overs' from the previous
        // close; therefore, let's start with an empty order from the bar *before* we started
        // our trades
        orders: new Map(),
        // Array of orders, see createOrder.mjs
        positions: [],
    }]);

    debug(
        'Trades executed, final amount is %d',
        tradeResult.cash + Array
            .from(tradeResult.slice(-1).pop().positionValues.values())
            .reduce((prev, value) => prev + value, 0),
    );

    const endTime = performance.now();
    const totalTime = Math.round(endTime - startTime);
    const timePerEntry = Math.round((totalTime / timeSeriesGroupedByDate.length) * 100) / 100;
    output.succeed(`Trading done for ${timeSeriesGroupedByDate.length} dates in ${totalTime} ms, ${timePerEntry} ms per entry`);

    return {
        ...data,
        result: tradeResult,
    };

};
