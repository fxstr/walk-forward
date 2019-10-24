/**
 * Generate startIdx and endIdx from talibData.
 * startIdx is always 0 and must be manually set to a higher number, if desired (e.g. if calculating
 * a SMA from another SMA) because startIdx is the index that the first result should be returned
 * for. For a SMA(3) based on a SMA(2), startIdx is therefore not 1 (where data would be available),
 * but 1 + 3 = 4.
 * @param  {Object} talibData  Data for talib in the form of { talibKey: [1, 4], otherKey: [5, 3] }
 * @return {Object}            Start and end index for talibData, e.g. { startIdx: 0, endIdx: 5} if
 *                             length of longest array is 6.
 */
export default function generateIndexesFromTalibData(talibData) {

    return Object.values(talibData).reduce((prev, dataSet) => (
        {
            endIdx: Math.min(prev.endIdx, dataSet.length - 1),
            // startIdx: Math.max(
            // prev.startIdx, dataSet.findIndex(item => typeof item === 'number')),
            startIdx: 0,
        }
    ), { startIdx: 0, endIdx: Infinity });

}
