/**
 * Groups an array of any items by field provided.
 * @param {Array} data      Array whose items should be grouped
 * @param {Function} field  Function that takes an item of array and returns the value that the
 *                          array should be grouped by
 * @return {Array}          Array with an item per group, where first item is the field we grouped
 *                          by and second item is an Array of all corresponding values, e.g.@async
 *                          [['key', ['value1', 'value2']]]. Return an array as it is versatile and
 *                          can easily be converted to a Map.
 */
export default function groupBy(data, field) {
    const groupedMap = data.reduce((prev, item) => (
        new Map(prev).set(
            field(item),
            prev.has(field(item)) ? [...prev.get(field(item)), item] : [item],
        )
    ), new Map());
    return Array.from(groupedMap.entries());
}
