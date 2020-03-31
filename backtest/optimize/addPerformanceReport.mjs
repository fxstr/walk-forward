/**
 * Adds performance data (of an optimization run) to previous performance reports
 * @param {object} backtest          Backtest data as created by useData()
 * @param {Map} parameterSet         Parameter set for current optimization run
 * @param {[type]} previousReport    Previous performance data
 * @return {object[]}                Previous data and newly appended data
 */
export default (backtest, parameterSet, previousReport = []) => [
    ...previousReport,
    {
        performance: backtest.performance,
        parameterSet,
    },
];
