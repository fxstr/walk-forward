/**
 * JSON cannot export Maps; we have to convert them manually (to an object, as we only need
 * primitives as keys) in order to write data to a file.
 */
export default function convertMapsToObjects(data) {
    if (Array.isArray(data)) {
        return data.map(item => convertMapsToObjects(item));
    } else if (data instanceof Map) {
        const output = {};
        // Some keys of a Map (e.g. a Map, an Object or Array) cannot become keys of an object.
        // Make sure we throw if this is the case.
        Array.from(data.entries()).forEach((entry) => {
            const [key, value] = entry;
            if (
                typeof key === 'string' ||
                typeof key === 'number' ||
                typeof key === 'boolean' ||
                typeof key === 'symbol' ||
                key === undefined ||
                key === null
            ) {
                output[key] = convertMapsToObjects(value);
            } else {
                throw new Error(`convertMapsToObjects: Cannot convert Map to Object as key ${key} is not of a type that an Object accepts as a property.`);
            }
        });
        return output;
    } else if (typeof data === 'object' && data !== null) {
        // Check for object *after* Map as a Map is also an object
        // Key can only be a primitive for an object, no need to convert it
        const output = {};
        Object.entries(data).forEach((entry) => {
            const [key, value] = entry;
            output[key] = convertMapsToObjects(value);
        });
        return output;
    } else {
        return data;
    }
}
