/**
 * Returns test data for result property
 */

/**
 * [description]
 * @param {number} date
 * @param {number} cash
 * @param {array[]} orders    e.g. [['aapl', 5], ['amzn', -3]]
 * @param {array[]} positions One entry per position with
 *                            - instrument name
 *                            - size
 *                            - open date
 *                            - position value
 *                            - openPrice
 *                            - marginPrice (if different from openPrice), e.g.
 *                            ['aapl', 4, 1, 9, 4.5]
 * @return {object}
 */
const createEntry = (date, cash, orders = [], positions = []) => ({
    date: new Date(2019, 0, date, 0, 0, 0).getTime(),
    cash,
    orders: new Map(orders),
    positions: positions.map(position => ({
        instrument: position[0],
        size: position[1],
        openDate: new Date(2019, 0, position[2], 0, 0, 0).getTime(),
        openPrice: position[4],
        marginPrice: position[5] !== undefined ? position[5] : position[4],
    })),
    positionValues: new Map(positions.map(position => [position[0], position[3]])),
});

export default () => ({
    // Includes
    // - dates without data
    // - enlarging positions
    // - reducing positions
    // - long and short positions
    result: [
        createEntry(1, 1000, [['aapl', 2]]),
        // aapl open@19, close@20
        // Buy 2, margin 50%
        createEntry(2, 962, [], [['aapl', 2, 2, 40, 19, 8]]),
        // aapl close @ 22
        createEntry(3, 962, [['aapl', -1], ['amzn', -4]], [['aapl', 2, 2, 44, 19, 8]]),
        // aapl open@21, close@20
        // amzn open@10, close@11
        // cash: gain 21 from selling 1 aapl@21; pay 40 for 4 amzn@10
        createEntry(4, 943, [], [['aapl', 1, 2, 20, 19, 8], ['amzn', -4, 4, 36, 10, 5]]),
        // No data for jan 5
        // aapl close@23
        // amzn close@12
        createEntry(
            6,
            943,
            [['aapl', -1]],
            [['aapl', 1, 2, 23, 19, 8], ['amzn', -4, 4, 32, 10, 5]],
        ),
        // aapl open@23
        // amzn close@11
        // cash: sell 1 aapl for 23
        createEntry(7, 966, [['amzn', -4]], [['amzn', -4, 4, 36, 10, 5]]),
        // amzn open@12, close@13; value (40 + 4 * -3) + (44 + 4 * -1) = 28 + 40
        // cash: open -4@11 = 44
        createEntry(8, 922, [], [['amzn', -8, 4, 68, 11, 5.5]]),
    ],
});
