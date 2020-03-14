import linearRegressionSlope from './linearRegressionSlope.mjs';
import rSquared from './rSquared.mjs';
import getTotalCapital from '../trade/getTotalCapital.mjs';
import maxRelativeDrawdown from './maxRelativeDrawdown.mjs';
import calculatePositionStatistics from './calculatePositionStatistics.mjs';
import getClosedPositions from './getClosedPositions.mjs';

export default (data) => {

    const { result } = data;
    const capitaCurve = getTotalCapital(result);
    const closedPositions = getClosedPositions(result);
    const performance = {
        ...calculatePositionStatistics(closedPositions),
        annualRelativeGrowth: linearRegressionSlope(capitaCurve),
        annualRelativeGrowthVariance: rSquared(capitaCurve),
        maxRelativeDrawdown: maxRelativeDrawdown(capitaCurve),
    };

    return {
        ...data,
        performance: new Map(Object.entries(performance)),
    };

};
