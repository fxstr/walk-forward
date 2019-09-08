import debugLevels from './debugLevels.mjs';
/**
 * Parses environment config for debug levels.
 * @param  {String} debugLevelString
 * @return {String[]}
 */
export default function getDebugLevels(debugLevelString = '') {

    const levels = debugLevelString.toLowerCase().split(/\s*,\s*/);
    const validLevels = Object.keys(debugLevels);
    // If levels are not specified (array of empty string, as we split a string), all levels will
    // be logged

    // If environment variable is not set, levels will be ['']: Show all levels
    if (levels.length === 1 && levels[0] === '') return validLevels;

    return levels.filter((level) => {
        const valid = validLevels.includes(level);
        if (!valid) console.warn(`getDebugLevels: Level ${level} unknown, use one of ${validLevels.join(',')}.`);
        return valid;
    });

}
