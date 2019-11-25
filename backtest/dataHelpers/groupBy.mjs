/**
 * Groups an array of any items by field provided. If we use a reduce and re-create the map
 * with every function call (as we might expect from functional programming), things get very,
 * very slow.
 * @param {Array} data      Array whose items should be grouped
 * @param {Function} getField  Function that takes an item of array and returns the value that the
 *                          array should be grouped by
 * @return {Array}          Array with an item per group, where first item is the field we grouped
 *                          by and second item is an Array of all corresponding values, e.g.@async
 *                          [['key', ['value1', 'value2']]]. Return an array as it is versatile and
 *                          can easily be converted to a Map.
 */
export default function groupBy(data, getField) {
    const groupedMap = new Map();
    for (const item of data) {
        const key = getField(item);
        if (groupedMap.has(key)) groupedMap.get(key).push(item);
        else groupedMap.set(key, [item]);
    }
    return Array.from(groupedMap.entries());
}
