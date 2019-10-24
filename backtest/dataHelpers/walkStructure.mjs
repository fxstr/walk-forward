/**
 * Walks a data structure (array, object, Map), deeply clones it and applies provided
 * transformFunction on every item.
 * Dates, Regexes, Sets etc. are not handled as we do not use them (yet).
 * Needed to clone data or convert it to any other type.
 * @param {*} data                      Data you want to walk
 * @param {function} transformFunction  Function that is called with every item in data. Arguments
 *                                      are (current item, parent item, key).
 *                                      Defaults to identity function.
 *                                      Parent item and key are only passed for data
 *                                      structures with multiple entries (arrays, objects, Maps).
 *                                      For arrays, key is index.
 */
export default function walkStructure(
    data,
    transformFunction = value => value,
    parentData,
    keyData,
) {

    const transformed = transformFunction(data, parentData, keyData);

    if (Array.isArray(transformed)) {
        // Array: Map (to create new array) and walk over every item
        return transformed.map((item, index) => walkStructure(
            item,
            transformFunction,
            transformed,
            index,
        ));
    } else if (transformed instanceof Map) {
        // Map: Create a new Map and walk over every key and value
        const cloned = new Map();
        transformed.forEach((value, key) => {
            const newKey = walkStructure(key, transformFunction, transformed);
            const newValue = walkStructure(value, transformFunction, transformed, key);
            cloned.set(newKey, newValue);
        });
        return cloned;
    } else if (transformed instanceof Set) {
        const cloned = new Set();
        transformed.forEach((entry) => {
            const newValue = walkStructure(entry, transformFunction, transformed);
            cloned.add(newValue);
        });
        return cloned;
    } else if (typeof transformed === 'object' && transformed !== null) {
        // Object: Create a new Object and walk over every key and value
        // Check for object *after* Map as a Map is also an object
        const cloned = {};
        Object.entries(transformed).forEach((entry) => {
            const [key, value] = entry;
            const newKey = walkStructure(key, transformFunction, transformed);
            const newValue = walkStructure(value, transformFunction, transformed, key);
            cloned[newKey] = newValue;
        });
        return cloned;
    } else {
        // Everything else – primitives, Dates, Sets etc. We currently only support data structures
        // we actually need. These values are copied by reference, not cloned!
        return transformed;
    }
}
