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
    // - closing positions
    // - inverting position
    // Margin for aapl and amzn is 50%
    result: [
        createEntry(1, 1000, [['aapl', 2]]),
        // aapl open@19, close@20
        // Buy 2, margin 50%
        // Value: 2 * 9.5 + 2 * 1
        createEntry(2, 981, [], [['aapl', 2, 2, 21, 19, 9.5]]),
        // aapl close @ 22.
        // value is calculated depending on margin.
        createEntry(3, 981, [['aapl', -1], ['amzn', -4]], [['aapl', 2, 2, 25, 19, 9.5]]),
        // aapl open@21, close@20
        // amzn open@10, close@11
        // cash: gain 21 from selling 1 aapl@21; pay 40 for 4 amzn@10
        // value amzn: 4 * 5 - 4 * 1 = 16
        createEntry(4, 961, [], [['aapl', 1, 2, 10.5, 19, 9.5], ['amzn', -4, 4, 16, 10, 5]]),
        // No data for jan 5
        // aapl close@23
        // amzn close@12
        createEntry(
            6,
            961,
            [['aapl', -1]],
            [['aapl', 1, 2, 13.5, 19, 9.5], ['amzn', -4, 4, 12, 10, 5]],
        ),
        // aapl open@23
        // amzn close@11
        // cash: sell 1 aapl for 9.5 + 3 = 12.5
        // aapl is closed here
        createEntry(7, 973.5, [['amzn', -4]], [['amzn', -4, 4, 16, 10, 5]]),
        // amzn open@12, close@13; value (20 + 4 * -3) + (22 + 4 * -1) = 8 + 18
        // cash: open -4@5.5 = 22
        createEntry(8, 951.5, [['amzn', 10]], [['amzn', -8, 4, 26, 11, 5.5]]),
        // amzn open@13, close@15
        // cover 8 amzn@13; 4 shorted@10 (20 - 3 * 4), 4 shorted@12 (24 - 4) frees 28
        // buy 2 amzn@13 costs 13
        createEntry(9, 966.5, [], [['amzn', 2, 9, 15, 13, 6.5]]),
    ],
});
