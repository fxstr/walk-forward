import walkStructure from './walkStructure.mjs';

export default function convertMapsToObjects(data) {
    const transformFunction = (value) => {
        if (value instanceof Map) {
            const object = {};
            for (const [mapKey, mapValue] of value) {
                // Some keys of a Map (e.g. a Map, an Object or Array) cannot become keys of an
                // object. Make sure we throw if this is the case.
                if (
                    typeof mapKey === 'string' ||
                    typeof mapKey === 'number' ||
                    typeof mapKey === 'boolean' ||
                    typeof mapKey === 'symbol' ||
                    mapKey === undefined ||
                    mapKey === null
                ) {
                    object[mapKey] = mapValue;
                } else {
                    throw new Error(`convertMapsToObjects: Cannot convert Map to Object as key ${mapKey} is not of a type that an Object accepts as a property, but ${typeof mapKey}.`);
                }
            }
            return object;
        }
        // Return identity for everything that is not a Map
        return value;
    };
    return walkStructure(data, transformFunction);
}
