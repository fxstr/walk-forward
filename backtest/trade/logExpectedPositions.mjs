import createTableDataForLog from './createTableDataForLog.mjs';

/**
 * Logs expected positions
 * @param  {function} debug
 * @param  {Map} options.expectedPositions
 * @param  {Map} options.instructionFieldPrices
 * @param  {Map} options.pointValues
 */
export default (debug, { expectedPositions, instructionFieldPrices, pointValues }) => {

    try {

        const relevantInstruments = Array.from(expectedPositions.keys());

        const logPositions = Array.from(expectedPositions.entries())
            .map(([instrument, size]) => [instrument, [size]]);
        // instructionField may be undefined if data is not (yet) available
        const logInstructionFieldPrices = Array.from(instructionFieldPrices.entries())
            .map(([instrument, price]) => [instrument, [price ? price.toFixed(2) : '–']]);
        const logPointValues = Array.from(pointValues.entries())
            .map(([instrument, value]) => [instrument, [value.toFixed(2)]]);

        let dataForTable = createTableDataForLog(
            new Map(logPositions),
            new Map(logInstructionFieldPrices),
            new Map(logPointValues),
        );

        dataForTable = dataForTable
            .filter(([instrument]) => relevantInstruments.includes(instrument));
        dataForTable = [
            ['Instr.', 'Size', 'Instr. Field', 'Point Value'],
            ...dataForTable,
        ];

        debug(
            'Expected positions are %T',
            {
                data: dataForTable,
                config: {
                    singleLine: true,
                    columns: {
                        1: { alignment: 'right' },
                        2: { alignment: 'right' },
                        3: { alignment: 'right' },
                    },
                },
            },
        );

    }
    catch (err) {
        console.error(err);
    }

};
