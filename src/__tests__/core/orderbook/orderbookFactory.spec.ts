import OrderbookFactory from "../../../sockTrader/core/orderbook/orderbookFactory";
import Orderbook from "../../../sockTrader/core/orderbook/orderbook";

describe("getInstance", () => {

    it("Should return an orderbook instance", () => {
        const orderbook = OrderbookFactory.getInstance(["BTC", "USD"]);
        expect(orderbook).toBeInstanceOf(Orderbook);
    });

    it("Should return a singleton instance", () => {
        const orderbook1 = OrderbookFactory.getInstance(["BTC", "USD"]);
        const orderbook2 = OrderbookFactory.getInstance(["BTC", "USD"]);

        expect(orderbook1).toBe(orderbook2);
        expect(orderbook2).toBeInstanceOf(Orderbook);
    });
});
