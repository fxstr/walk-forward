import createTableDataForLog from './createTableDataForLog.mjs';

/**
 * Logs positions (open, merged, close) to a nicely formatted table.
 * @param {function} debug               debug function
 * @param {object} options
 * @param {object[]} options.opened      Positions on open
 * @param {object[]} options.merged      Positions after merge
 * @param {object[]} options.closed      Positions on close
 */
export default(debug, { opened, merged, closed } = {}) => {

    // Wrap in try/catch as it's not tested
    try {

        if (!merged.length && !opened.length && !closed.length) {
            debug('No positions on open or close');
            return;
        }

        // Create defaults if input has length 0; else row's size will be different from header
        // row and table will throw an error
        const openedData = (opened.length ? opened : [{ instrument: '', size: 0, value: 0 }])
            .map(({ instrument, size, value }) => [instrument, [size, value.toFixed(2)]]);
        const mergedData = (merged.length ? merged : [{ instrument: '', size: 0, value: 0 }])
            .map(({ instrument, size, value }) => [instrument, [size, value.toFixed(2)]]);
        const closedData = (closed.length ? closed : [{ instrument: '', value: 0 }])
            .map(({ instrument, value }) => [instrument, [value.toFixed(2)]]);


        let dataForTable = createTableDataForLog(
            new Map(openedData),
            new Map(mergedData),
            new Map(closedData),
        );

        // Add diff (size/value) between open and merged
        dataForTable.forEach((row) => {
            const valueDiff = (parseFloat(row[4]) - parseFloat(row[2])).toFixed(2);
            const sizeDiff = (parseFloat(row[3]) - parseFloat(row[1])).toFixed(0);
            row.splice(5, 0, sizeDiff, valueDiff);
        });

        dataForTable.sort((a, b) => (a[0] > b[0] ? 1 : -1));
        dataForTable = [
            ['Inst.', 'Open', 'Open', 'Merged', 'Merged', 'Delta', 'Delta', 'Close'],
            ['', 'Size', 'Value', 'Size', 'Value', 'Size', 'Value', 'Value'],
            ...dataForTable,
        ];

        debug('Positions are %T', {
            data: dataForTable,
            config: {
                singleLine: true,
                columns: {
                    1: { alignment: 'right' },
                    2: { alignment: 'right' },
                    3: { alignment: 'right' },
                    4: { alignment: 'right' },
                    5: { alignment: 'right' },
                    6: { alignment: 'right' },
                },
            },
        });

    }
    catch (err) {
        console.error(err);
    }



};
