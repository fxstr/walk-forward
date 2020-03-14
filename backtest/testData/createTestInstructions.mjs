/**
 * Creates a simple instruction
 */
const createInstruction = (instrument, day, selected = 1, weight = 1) => ({
    instrument,
    date: new Date(2019, 0, day, 0, 0, 0).getTime(),
    weight,
    selected,
    rebalance: true,
});


/**
 * Creates instructions that are used in trade.unit.mjs and also to create test result data
 * @param  {object} data      Data as created by createTestData.mjs
 * @return {object}           Data with updated instructions
 */
export default (data) => {

    // Update/overwrite instructions
    const findInstructionIndex = (instrument, date) => item => (
        item.date === date && item.instrument === instrument
    );

    // Clone data to not modify original
    const clonedData = { ...data, instructions: [...data.instructions] };

    [
        createInstruction('aapl', 1, -1, 2),
        createInstruction('amzn', 2, 1, 3),
        createInstruction('aapl', 2, -1, 2),
        // Switch position from short to long
        createInstruction('aapl', 4, 1),
        // Select 0 closes position
        createInstruction('aapl', 6, 0),
    ].forEach((item) => {
        const index = clonedData.instructions
            .findIndex(findInstructionIndex(item.instrument, item.date));
        if (index === -1) throw new Error(`trade.unit: Index not found for ${JSON.stringify(item)}`);
        clonedData.instructions[index] = item;
    });

    return clonedData;

};

