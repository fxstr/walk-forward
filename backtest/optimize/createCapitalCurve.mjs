/**
 * Creates an (empty) capital curve template for HighSTock. We need to add capital curve of a
 * backtest as soon as it was run to prevent memory leaks.
 */

export default () => ({
    yAxis: [{
        height: '100%',
        id: 'capital',
    }],
    series: [],
});
