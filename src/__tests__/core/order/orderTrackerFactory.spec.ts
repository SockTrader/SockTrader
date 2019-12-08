import OrderTrackerFactory from "../../../sockTrader/core/order/orderTrackerFactory";

describe("getInstance", () => {
    test("Should return the same OrderTracker instance", () => {
        expect(OrderTrackerFactory.getInstance()).toStrictEqual(OrderTrackerFactory.getInstance());
    });
});
