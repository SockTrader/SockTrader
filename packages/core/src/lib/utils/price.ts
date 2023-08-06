export type BasicOrder = { price: number; quantity: number };

/**
 * Calculate dollar cost average price of all fills to determine a "true" price.
 * @param {BasicOrder[]} order
 * @returns {number}
 */
export const dollarCostAverage = (order: BasicOrder[]): number => {
  const totalCost = order.reduce(
    (prev, current) => prev + current.price * current.quantity,
    0
  );
  const totalAmount = order.reduce(
    (prev, current) => prev + current.quantity,
    0
  );

  return totalCost / totalAmount;
};
