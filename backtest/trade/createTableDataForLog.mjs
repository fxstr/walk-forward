/**
 * [description]
 * @param {array}    validKeys           Keys (of Maps in data) that should be printed
 * @param {Map.<string, object>[]} data  Data to print; Maps with string as key and object of
 *                                       columns to print. All Maps will be matched by their key.
 * @return {array[]}                     Data structure as expected by table plugin
 */
export default (...data) => {

    const allKeys = data
        .map(map => Array.from(map.keys()))
        .flat();
    const keys = new Set(allKeys);

    const result = Array.from(keys).map(key => [key]);
    data.forEach((dataSet) => {
        // Assume all dataSetRows have the same amount of items; get the first row's item count
        const firstDataSetRow = Array.from(dataSet.values())[0];
        const itemCount = firstDataSetRow ? firstDataSetRow.length : 0;
        result.forEach((row) => {
            const dataSetRow = dataSet.get(row[0]) ||
                Array.from({ length: itemCount }).map(() => 0);
            row.push(...dataSetRow);
        });
    });

    return result;

};
