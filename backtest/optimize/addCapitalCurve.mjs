import getTotalCapital from '../trade/getTotalCapital.mjs';

/**
 * Adds capital curve of a backtest to HighStock representation of multiple capital curves of
 * an optimization
 * @param {object} previousCapitalCurve    Capital curves for the previously run backtests;
 *                                         originally created by createCapitalCurve
 * @param {object} backtests               Backtest data created by useData() whose results
 *                                         we should add to the capitalCurve
 * @param {Map[]} parameterSets            Parameter set for the current backtest
 * @return {object}                        Object for Highstock
 */
export default (previousCapitalCurve, backtest, parameterSet) => {

    const parameters = Array.from(parameterSet.entries())
        .map(parameter => parameter.join(': ')).join(', ');

    const series = [
        ...previousCapitalCurve.series,
        {
            type: 'line',
            data: getTotalCapital(backtest.result),
            name: parameters,
        },
    ];

    return {
        ...previousCapitalCurve,
        series,
    };

};
