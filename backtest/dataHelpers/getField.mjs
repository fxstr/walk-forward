/**
 * Returns property with name field of structure.
 * @param {Object|Map} structure      Structuure to get property field of
 * @param {*} field                   Property name to get and return
 * @returns {*}
 */
export default (structure, field) => {
    if (structure instanceof Map) return structure.get(field);
    else if (structure !== null && typeof structure === 'object') return structure[field];
    throw new Error(`getField: Cannot return field ${field} of structure ${JSON.stringify(structure)}, because it's not a Map nor an object.`);
};
