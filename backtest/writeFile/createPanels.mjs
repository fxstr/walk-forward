import logger from '../logger/logger.mjs';

const { debug } = logger('WalkForward:createPanels');

/**
 * Converts panel options to highstock formatted data
 * @param  {Map} options     Map where
 *                           - key is the panel's name
 *                           - options are the panel's options (e.g. height)
 * @return {Object[]}        yAxis options for Highstock
 */
export default function createPanels(options) {

    // Sum of all (relative) panel heights
    const allPanelsHeight = Array.from(options.values())
        .reduce((prev, panel) => prev + (panel.height || 0), 0);

    debug('Height of all panels is %d', allPanelsHeight);

    const yAxisData = Array.from(options.entries())
        .reduce((prev, [panelName, panelOptions]) => {
            const percentualHeight = Math.round((panelOptions.height / allPanelsHeight) * 100);
            debug(
                'Percentual height %o, panel height %o, allPanels %o',
                percentualHeight,
                panelOptions.height,
                allPanelsHeight,
            );

            const yAxisConfig = {
                // panelOptions at the beginning so that height will be overwritten by the adjusted
                // relative height (percent)
                ...panelOptions,
                top: `${prev.top}%`,
                height: `${percentualHeight}%`,
                id: panelName,
            };
            return { top: prev.top + percentualHeight, data: [...prev.data, yAxisConfig] };
        }, { top: 0, data: [] });

    debug('Data for panels is %o', yAxisData.data);

    return yAxisData.data;

}
