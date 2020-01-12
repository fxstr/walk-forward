import stats from 'simple-statistics';
import groupBy from '../dataHelpers/groupBy.mjs';

/**
 * Calculates rSquared for a given capital curve.
 * @param  {array[]} capital    Capital as [[date, capital], [date, capital]]
 * @return {number}
 */
export default (capital) => {
    const capitalByYear = groupBy(capital, entry => new Date(entry[0]).getFullYear());
    const yearlyGrowthRate = capitalByYear.map(([, capitalCurve]) => {
        // Slope of 1 ms; multiply by mPerDay to get slope per day
        const regressionFunction = stats.linearRegressionLine(stats.linearRegression(capitalCurve));
        return stats.rSquared(capitalCurve, regressionFunction);
    });
    return yearlyGrowthRate.reduce((sum, rate) => sum + rate, 0) / capitalByYear.length;
};

