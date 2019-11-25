import executeOrders from './executeOrders.mjs';
import getPositionsValues from './getPositionsValues.mjs';
import createOrders from './createOrders.mjs';

export default (
    date,
    openPrices,
    closePrices,
    instructionSet,
    { investedRatio, maxRatioPerInstrument },
    previous,
) => {

    // Execute orders (in the morning, when only open prices are known)
    const { positions, unfulfilledOrders, cost } = executeOrders(
        // Use orders from previous close
        previous.orders,
        openPrices,
        // Pass in previous positions
        previous.positions,
        date,
    );
    const cash = previous.cash - cost;


    // Get values of all positions (in the evening when close prices are known); value is needed
    // to calculate orders for next day.
    const positionValues = getPositionsValues(
        positions,
        previous.positionValues,
        closePrices,
    );
    // Get total current value of all current positions
    const allPositionsValue = Array
        .from(positionValues.values())
        .reduce((prev, value) => prev + value, 0);

    // Create expected positions for next bar. Sizes are absolute (-28 means that we should be
    // 28 total short, not add another short position of 28).
    const newPositions = createOrders(
        instructionSet,
        closePrices,
        cash + allPositionsValue,
        investedRatio,
        maxRatioPerInstrument,
    );


    // To create orders, sizes must be relative; calculate size from difference between previous
    // and new positions.
    const newOrders = new Map(Array
        .from(newPositions.entries())
        .map(([instrument, size]) => [
            instrument,
            // Deduct size of existing position from new position size
            size - ((positions.find(existingPosition =>
                existingPosition.instrument === instrument) || {}).size || 0),
        ])
        // Remove orders witz size 0, there is nothing to execute
        .filter(([, size]) => size !== 0));


    // Orders should be valid until they are fulfilled (GTC). Therefore merge old unfulfilled
    // orders with new ones.
    const orders = new Map([
        ...unfulfilledOrders,
        ...newOrders,
    ]);


    return {
        date,
        positions,
        orders,
        positionValues,
        cash,
    };

};
