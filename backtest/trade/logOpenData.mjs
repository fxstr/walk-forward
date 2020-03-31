import createTableDataForLog from './createTableDataForLog.mjs';

/**
 * Writes logs for open data
 * @param {function} debug                       debug fuction
 * @param {object} options
 * @param {Set} options.relevantInstruments
 * @param {Map} options.relativeMargins
 * @param {Map} options.openPrices
 */
export default (debug, { relevantInstruments, relativeMargins, openPrices }) => {

    try {

        const logMarginData = Array.from(relativeMargins.entries())
            .map(([instrument, margin]) => [instrument, [margin.toFixed(2)]]);
        const logOpenPrices = Array.from(openPrices.entries())
            .map(([instrument, price]) => [instrument, [price.toFixed(2)]]);

        let dataForTable = createTableDataForLog(
            new Map(logOpenPrices),
            new Map(logMarginData),
        );

        dataForTable = dataForTable.filter(([instrument]) => relevantInstruments.has(instrument));
        dataForTable = [
            ['Instr.', 'Open', 'Margin'],
            ...dataForTable,
        ];

        debug(
            'Open prices and margin prices are %T',
            {
                data: dataForTable,
                config: {
                    singleLine: true,
                    columns: {
                        1: { alignment: 'right' },
                        2: { alignment: 'right' },
                    },
                },
            },
        );

    }
    catch (err) {
        console.error(err);
    }

};
