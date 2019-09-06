import moment from "moment";
import LocalCandleProcessor from "../../../../sockTrader/core/exchanges/candleProcessors/localCandleProcessor";
import OrderTracker from "../../../../sockTrader/core/exchanges/utils/orderTracker";
import LocalExchange from "../../../../sockTrader/core/exchanges/localExchange";
import {IOrder, OrderSide, OrderStatus, ReportType} from "../../../../sockTrader/core/types/order";
import {ICandle} from "../../../../sockTrader/core/types/ICandle";

function createCandleProcessor() {
    const tracker = new OrderTracker();
    tracker.setOpenOrders([{id: "123", side: OrderSide.BUY, price: 10, createdAt: moment()} as IOrder]);

    return new LocalCandleProcessor(tracker, new LocalExchange());
}

const fillCandles = [{low: 5, timestamp: moment().add(1, "day")}] as ICandle[];
const notFillCandles = [{low: 15, timestamp: moment().add(1, "day")}] as ICandle[];

let candleProcessor = createCandleProcessor();
beforeEach(() => {
    candleProcessor = createCandleProcessor();
});

describe("onSnapshotCandles", () => {
    test("Should process open orders", () => {
        const spy = jest.spyOn(candleProcessor, "processOpenOrders" as any);
        candleProcessor.onSnapshotCandles(["BTC", "USD"], fillCandles, {code: "code", cron: "*"});

        expect(spy).toBeCalledWith({low: 5, timestamp: expect.any(moment)});
    });
});

describe("onUpdateCandles", () => {
    test("Should process open orders", () => {
        const spy = jest.spyOn(candleProcessor, "processOpenOrders" as any);
        candleProcessor.onUpdateCandles(["BTC", "USD"], fillCandles, {code: "code", cron: "*"});

        expect(spy).toBeCalledWith({low: 5, timestamp: expect.any(moment)});
    });
});

describe("onProcessCandles", () => {
    test("Should set empty array in OrderTracker when all orders are filled", () => {
        const spy = jest.spyOn(candleProcessor["orderTracker"], "setOpenOrders");

        candleProcessor.onProcessCandles(fillCandles);
        expect(spy).toBeCalledWith([]);
    });

    test("Should set all open orders in OrderTracker", () => {
        const spy = jest.spyOn(candleProcessor["orderTracker"], "setOpenOrders");

        candleProcessor.onProcessCandles(notFillCandles);
        expect(spy).toBeCalledWith([expect.objectContaining({
            createdAt: expect.any(moment),
            id: "123",
            price: 10,
            side: OrderSide.BUY
        })]);
    });

    test("Should notify exchange about the filled order", () => {
        const spy = jest.spyOn(candleProcessor["exchange"], "onReport");

        candleProcessor.onProcessCandles(fillCandles);
        expect(spy).toBeCalledWith(expect.objectContaining({
            createdAt: expect.any(moment),
            id: "123",
            price: 10,
            side: OrderSide.BUY,
            reportType: ReportType.TRADE,
            status: OrderStatus.FILLED,
        }));
    });
});
