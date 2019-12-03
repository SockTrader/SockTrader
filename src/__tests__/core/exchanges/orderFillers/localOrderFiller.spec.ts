import moment from "moment";
import LocalOrderFiller from "../../../../sockTrader/core/exchanges/orderFillers/localOrderFiller";
import OrderTracker from "../../../../sockTrader/core/order/orderTracker";
import {OrderSide, OrderStatus, ReportType} from "../../../../sockTrader/core/types/order";
import Wallet from "../../../../sockTrader/core/plugins/wallet/wallet";
import {FX_NEW_BUY_ORDER, FX_NEW_SELL_ORDER} from "../../../../__fixtures__/order";
import {FX_FILL_CANDLES, FX_HISTORICAL_CANDLES, FX_NOT_FILL_CANDLES} from "../../../../__fixtures__/candles";
import {Candle} from "../../../../sockTrader/core/types/Candle";

function createOrderFiller() {
    const tracker = new OrderTracker();
    tracker.setOpenOrders([FX_NEW_BUY_ORDER]);

    return new LocalOrderFiller(tracker, new Wallet({BTC: 10, USD: 10000}));
}

let orderFiller = createOrderFiller();
beforeEach(() => {
    orderFiller = createOrderFiller();
});

describe("onSnapshotCandles", () => {
    test("Should process open orders", () => {
        const spy = jest.spyOn(orderFiller, "processOpenOrders" as any);
        orderFiller.onSnapshotCandles(["BTC", "USD"], FX_FILL_CANDLES, {code: "code", cron: "*"});

        expect(spy).toBeCalledWith({
            open: 100,
            high: 110,
            low: 99,
            close: 102,
            volume: 1000,
            timestamp: expect.any(moment),
        });
    });
});

describe("onUpdateCandles", () => {
    test("Should process open orders", () => {
        const spy = jest.spyOn(orderFiller, "processOpenOrders" as any);
        orderFiller.onUpdateCandles(["BTC", "USD"], FX_FILL_CANDLES, {code: "code", cron: "*"});

        expect(spy).toBeCalledWith({
            open: 100,
            high: 110,
            low: 99,
            close: 102,
            volume: 1000,
            timestamp: expect.any(moment),
        });
    });
});

describe("isOrderWithinCandle", () => {
    test.each([
        [true, 90, "is below"], [false, 100, "equals"], [false, 101, "is above"],
    ])(`Should return %s if candle low (%s) %s price of order (${FX_NEW_BUY_ORDER.price})`, (result, low) => {
        expect(orderFiller["isOrderWithinCandle"](FX_NEW_BUY_ORDER, {low} as Candle)).toBe(result);
    });

    test.each([
        [true, 110, "is above"], [false, 100, "equals"], [false, 99, "is below"],
    ])(`Should return %s if candle high (%s) %s price of order (${FX_NEW_SELL_ORDER.price})`, (result, high) => {
        expect(orderFiller["isOrderWithinCandle"](FX_NEW_SELL_ORDER, {high} as Candle)).toBe(result);
    });
});

describe("onProcessCandles", () => {
    test("Should keep open order if candle is older than order", () => {
        const spy = jest.spyOn(orderFiller["orderTracker"], "setOpenOrders");

        orderFiller.onProcessCandles(FX_HISTORICAL_CANDLES);
        expect(spy).toBeCalledWith([expect.objectContaining({
            createdAt: expect.any(moment),
            id: "NEW_BUY_ORDER_1",
            price: 100,
            side: OrderSide.BUY,
        })]);
    });

    test("Should clear order tracker if all orders haven been filled", () => {
        const spy = jest.spyOn(orderFiller["orderTracker"], "setOpenOrders");

        orderFiller.onProcessCandles(FX_FILL_CANDLES);
        expect(spy).toBeCalledWith([]);
    });

    test("Should keep all open orders if nothing could have been filled", () => {
        const spy = jest.spyOn(orderFiller["orderTracker"], "setOpenOrders");

        orderFiller.onProcessCandles(FX_NOT_FILL_CANDLES);
        expect(spy).toBeCalledWith([expect.objectContaining({
            createdAt: expect.any(moment),
            id: "NEW_BUY_ORDER_1",
            price: 100,
            side: OrderSide.BUY,
        })]);
    });

    test("Should process order by orderTracker", () => {
        const spy = jest.spyOn(orderFiller["orderTracker"], "process");

        orderFiller.onProcessCandles(FX_FILL_CANDLES);
        expect(spy).toBeCalledWith(expect.objectContaining({
            createdAt: expect.any(moment),
            id: "NEW_BUY_ORDER_1",
            price: 100,
            side: OrderSide.BUY,
            reportType: ReportType.TRADE,
            status: OrderStatus.FILLED,
        }));
    });
});
