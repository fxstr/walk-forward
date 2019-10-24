import logger from '../logger/logger.mjs';
import walkStructure from '../dataHelpers/walkStructure.mjs';

const { debug } = logger('WalkForward:handleViewOptions');

/**
 * Re-formats and merges view options
 * @param {Object} previousOptions     View options before they were merged with newOptions
 * @param {Object} newOptions          Options that should be merged with previousOptions, e.g.
 *                                     {
 *                                          panels: new Map([
 *                                              ['adx', { height: 0.5 }]
 *                                          ]),
 *                                          series: new Map([
 *                                              ['slowK', { type: 'line', panel: 'adx' }],
 *                                              ['slowD', { panel: 'otherPanel' }],
 *                                          ]),
 *                                      }
 * @param {Object} newOptions.panels   New panels that should be added to viewOptions
 * @param {Object} newOptions.series   Options for series
 * @return {Object}                    newOptions merged with previousOptions, e.g.
 *                                      {
 *                                          panel: new Map([
 *                                              ['panel1', { height: 0.5 }],
 *                                              ['panel2', { height: 1 }],
 *                                          ]),
 *                                          series: new Map([
 *                                              ['name', {
 *                                                  panel: 'panel1',
 *                                                  type: 'line',
 *                                              }]
 *                                          ]),
 *                                      }
 */
export default function handleViewOptions(previousOptions = {}, newOptions = {}) {

    if (typeof previousOptions !== 'object' || previousOptions === null) {
        throw new Error(`handleViewOptions: previousOptions must be an object, is ${JSON.stringify(previousOptions)}.`);
    }
    if (typeof newOptions !== 'object' || newOptions === null) {
        throw new Error(`handleViewOptions: newOptions must be an object, is ${JSON.stringify(newOptions)}.`);
    }

    const clone = walkStructure(previousOptions);

    // Panels

    const newPanels = newOptions.panels || new Map();
    if (!(newPanels instanceof Map)) {
        throw new Error(`handleViewOptions: panels property on newOptions must be a Map, is ${JSON.stringify(newPanels)}.`);
    }

    clone.panels = new Map([...(clone.panels || new Map()), ...newPanels]);

    // Series
    clone.series = clone.series || new Map();
    const newSeries = newOptions.series || new Map();
    if (!(newSeries instanceof Map)) {
        throw new Error(`handleViewOptions: series property on newOptions must be a Map, is ${JSON.stringify(newSeries)}.`);
    }

    // See if panels are available
    newSeries.forEach((options, seriesIdentifier) => {
        const panelIdentifier = options.panel;
        // panelIdentifier may be undefined, if series should be added to main panel. See if
        // non-undefined panels exist
        if (!panelIdentifier) return;
        if (!clone.panels.has(panelIdentifier)) {
            throw new Error(`handleViewOptions: Panel ${panelIdentifier} does not exist, was used for series ${seriesIdentifier}.`);
        }
    });

    clone.series = new Map([...(clone.series || new Map()), ...newSeries]);

    debug(
        'Added view options %o to previous options %o. New viewOptions are %o',
        newOptions,
        previousOptions,
        clone,
    );

    return clone;

}


