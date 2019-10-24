import handleViewOptions from './handleViewOptions.mjs';
import walkStructure from '../dataHelpers/walkStructure.mjs';

/**
 * Re-formats passed view options and adds them to data.viewOptions
 * @param {Object} data          Data «stream» as created by useData
 * @param {Object} options       View options
 * @param {Map} options.panels   Panel options; key is the panel's identifier, value is an object
 *                               with keys: height
 * @param {Map} options.series   Series options; key is the series' identifier (column name), value
 *                               is an object with keys: type (e.g. line)
 * @returns {Object}             Cloned data with added view options
 */
export default function addViewOptions(data, options) {
    const newViewOptions = handleViewOptions(data.viewOptions, options);
    const clone = walkStructure(data);
    clone.viewOptions = newViewOptions;
    return clone;
}
