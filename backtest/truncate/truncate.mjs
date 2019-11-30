import { performance } from 'perf_hooks';
import spinner from '../spinner/spinner.mjs';

/**
 * Cuts off data.timeSeries and data.instructions that lie outside fromDate and toDate
 * @param {object} data       See useData
 * @param {number?} fromDate  Start of timespan
 * @param {number?} toDate    End of timespan
 * @return {object}           Updated data object
 */
export default (data, fromDate, toDate) => {

    const output = spinner('Truncating …');
    const startTime = performance.now();

    // As only some arguments may be given, use defaults if they're not
    const adjustedFromDate = typeof fromDate === 'number' ? fromDate : -Infinity;
    const adjustedToDate = typeof toDate === 'number' ? toDate : Infinity;

    const timeSpanFilter = getFieldFunction => date => (
        getFieldFunction(date) >= adjustedFromDate && getFieldFunction(date) <= adjustedToDate
    );

    const returnValue = {
        ...data,
        timeSeries: data.timeSeries.filter(timeSpanFilter(entry => entry.get('date'))),
        instructions: data.instructions.filter(timeSpanFilter(entry => entry.date)),
    };

    const endTime = performance.now();
    output.succeed(`Executed truncate in ${Math.round(endTime - startTime)} ms`);

    return returnValue;

};
