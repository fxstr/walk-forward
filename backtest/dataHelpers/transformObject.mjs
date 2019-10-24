/**
 * Applies a transformer function to every entry of object and returns a new (cloned) object.
 * Needed to re-format data we read (e.g. from a CSV).
 * @param {Object} data                 Object to transform
 * @param {Function} transformFunction  Transformation to apply to all object entries. Is called
 *                                      with [key, value] for every entry.
 */
export default function transformObject(data, transformFunction) {

    return Object
        .entries(data)
        .map(transformFunction)
        .reduce((prev, [key, value]) => (
            // Clone prev object
            Object.assign(prev, { [key]: value })
        ), {});

}
