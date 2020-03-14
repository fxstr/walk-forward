import createTestData from './createTestData.mjs';
import createTestInstructions from './createTestInstructions.mjs';
import trade from '../trade/trade.mjs';

/**
 * Creates test data for a traded strategy. Uses createTestData and createTestInstructions, then
 * runs the instructions against data via trade(). This ensures that the data structure is always
 * up to date.
 * Expected result can be seen in trade.unit.mjs!
 * @param {object} configuration      Configuration that overwrites the d efault config
 */
export default (configuration) => {
    const dataWithoutInstructions = createTestData().data;
    const data = createTestInstructions(dataWithoutInstructions);
    const defaultConfiguration = {
        investedRatio: 0.9,
        maxRatioPerInstrument: 0.8,
    };
    data.configuration = {
        ...data.configuration,
        ...defaultConfiguration,
        ...configuration,
    };
    return trade(data, 1000);
};

