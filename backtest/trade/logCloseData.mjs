import createTableDataForLog from './createTableDataForLog.mjs';

/**
 * Logs closePrices and pointValues for positions that are open on close
 * @param {fuction} debug                   debug fuctio
 * @param {object} optios
 * @param {object[]} options.positionsOnClose
 * @param {Map.<strig, number>} options.closePrices
 * @param {Map.<string, number>} options.pointValues
 */
export default (debug, { positionsOnClose, closePrices, pointValues } = {}) => {

    try {
        const instrumentsOnClose = positionsOnClose.map(({ instrument }) => instrument);

        const logClosePrices = Array.from(closePrices.entries())
            .map(([instrument, price]) => [instrument, [price]]);
        const logPointValues = Array.from(pointValues.entries())
            .map(([instrument, value]) => [instrument, [value]]);

        let dataForTable = createTableDataForLog(
            new Map(logClosePrices),
            new Map(logPointValues),
        );

        dataForTable = dataForTable.filter(item => instrumentsOnClose.includes(item[0]));
        dataForTable = [
            ['Inst.', 'Close', 'PointValue'],
            ...dataForTable,
        ];

        debug(
            'Closing prices and pointValues are %T',
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
