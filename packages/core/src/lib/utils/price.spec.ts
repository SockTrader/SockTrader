import { dollarCostAverage } from './price';

describe('Price', () => {
  it('should calculate dollar cost average price', () => {
    expect(
      dollarCostAverage([
        { price: 200, quantity: 1 },
        { price: 100, quantity: 1 },
      ])
    ).toEqual(150);
  });
});
