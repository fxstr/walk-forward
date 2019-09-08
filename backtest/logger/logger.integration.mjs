import test from 'ava';
import getDebugLevels from './getDebugLevels.mjs';
import { getConfig } from './environment.mjs';
import logger from './logger.mjs';

function setEnv() {
    const originalEnv = process.env;
    process.env = {
        // Comma with/without space, upper case, valid and invalid
        TEST_DEBUG_LEVELS: 'info, Debug,invalid',
    };
    return originalEnv;
}

function resetEnv(originalContent) {
    process.env = originalContent;
}

// Test only for node environment for now
test('reads and parses config', (t) => {
    const original = setEnv();
    const config = getConfig('TEST_DEBUG_LEVELS');
    t.deepEqual(getDebugLevels(config), ['info', 'debug']);
    resetEnv(original);
});

test('uses all levels when none is set', (t) => {
    const original = setEnv();
    t.deepEqual(getDebugLevels(undefined), ['debug', 'info', 'warn', 'error']);
    resetEnv(original);
});


/* test('logs correctly', (t) => {

    // Spy on console, fake environment
    const original = setEnv();

    // Debug's node version does not use console.log:
    // https://github.com/visionmedia/debug/blob/master/src/node.js#L189

    // We would need to spy earlier (maybe before importing)
    const originalStdErr = process.stderr.write;
    let errParams;
    process.stderr.write = (...params) => {
        errParams = params;
    };
    process.stderr.write = originalStdErr;

    const log = logger('test');
    log.info('content here');
    t.is(errParams, 0);

    // Re-set environment and console
    resetEnv(original);
}); */
