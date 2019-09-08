/**
 * Every row of every CSV file must be transformed to match our internal data strcutures. This is
 * what transformRow does:
 * 1. Applies transformerFunction to every value in the current row
 * 2. Reformats CSV data to internal data structure
 *
 * @param {Object} row                    Row data (as read by CSV parser)
 * @param {Function} transformerFunction  See readFromCSV
 * @return {Array}                        Array from which a Map can be constructed; see readFromCSV
 */
export default (row, transformerFunction = (([key, value]) => [key, value])) => {

    // Apply transformerFunction to every value in row
    const transformedRow = new Map(Object.entries(row).map(transformerFunction));

    // 'date' column will become our Map's key; make sure it's valid. All other columns will be
    // checked when needed.
    if (!transformedRow.has('date') || typeof transformedRow.get('date') !== 'number') {
        throw new Error(`transformRow: Every row must contain a field 'date' that is a timeStamp (number); this is not the case for row ${JSON.stringify(Array.from(transformedRow.entries()))}`);
    }

    // Return correctly formed row; as it will be part of a Map, we return an array with
    // [key, value].
    // Clone otherData, then remove date key
    const otherData = new Map(transformedRow);
    otherData.delete('date');
    return [
        transformedRow.get('date'),
        {
            selected: false,
            weight: 1,
            order: undefined,
            data: otherData,
        },
    ];

};
