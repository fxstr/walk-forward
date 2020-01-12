import stats from 'simple-statistics';
import groupBy from '../dataHelpers/groupBy.mjs';

/**
 * Returns linear regression /percent per year) for a given capital curve. We split up the curve
 * per year as it might/should be exponential; by calculating it for years, we can use a linear
 * regression and take the average slope.
 * @param  {array[]} capital     Capital curve as [[date, capital], [date, capital]]
 * @return {number}
 */
export default (capital) => {
    const capitalByYear = groupBy(capital, entry => new Date(entry[0]).getFullYear());
    const msPerDay = 24 * 60 * 60 * 1000;
    const yearlyGrowthRate = capitalByYear.map(([year, capitalCurve]) => {
        // Slope of 1 ms; multiply by mPerDay to get slope per day
        const { b, m } = stats.linearRegression(capitalCurve);
        // Get (interpolated) value at the year's beginning
        const jan1 = new Date(year, 0, 1, 0, 0, 0).getTime();
        const startValue = stats.linearRegressionLine({ b, m })(jan1);
        const mPerYear = m * msPerDay * 365;
        const growthRate = ((mPerYear + startValue) / startValue) - 1;
        return growthRate;
    });
    // Return average growth rate
    return yearlyGrowthRate.reduce((sum, growthRate) => sum + growthRate, 0) / capitalByYear.length;
};

