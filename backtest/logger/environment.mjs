/**
 * Exports current environment, needed to retreive config
 * See https://github.com/visionmedia/debug/blob/master/src/index.mjs
 * @return {string} 'browser' or 'node'
 */
function getEnvironment() {
    if (
        typeof process === 'undefined' ||
        process.type === 'renderer' ||
        process.browser === true ||
        process.__nwjs
    ) {
        return 'browser';
    } else {
        return 'node';
    }
}

function getConfig(configName) {
    const environment = getEnvironment();
    if (environment === 'browser') {
        return localStorage.get(configName);
    }
    else {
        return process.env[configName];
    }
}

export { getConfig };
