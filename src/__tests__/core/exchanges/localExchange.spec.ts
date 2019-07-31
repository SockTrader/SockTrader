import moment from "moment";
import {Pair} from "../../../sockTrader/core/types/pair";
import LocalExchange from "../../../sockTrader/core/exchanges/localExchange";
import {
    IOrder,
    OrderSide,
    OrderStatus,
    OrderTimeInForce,
    OrderType,
    ReportType,
} from "../../../sockTrader/core/types/order";
import {ICandle} from "../../../sockTrader/core/types/ICandle";

process.env.SOCKTRADER_TRADING_MODE = "LIVE";

const pair: Pair = ["BTC", "USD"];

let exchange = new LocalExchange();
let sendMock = jest.fn();
let emitMock = jest.fn();

beforeEach(() => {
    exchange = new LocalExchange();
    exchange.send = sendMock;
    exchange.emit = emitMock;
    exchange["isAdjustingAllowed"] = jest.fn(() => true);
});

afterEach(() => jest.clearAllMocks());

describe("adjustOrder", () => {
    test("Should throw error with current candle undefined", () => {
        expect(() => exchange.adjustOrder(null as any, 10, 10))
            .toThrow("Cannot adjust order. No candles have been emitted.");
    });

    test("Should adjust given order", () => {
        exchange.onReport = jest.fn();
        exchange["orderManager"]["setOrderProcessing"] = jest.fn();
        exchange["currentCandle"] = {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: moment()} as ICandle;

        exchange.adjustOrder({pair: pair, id: "123"} as IOrder, 0.002, 0.5);
        expect(exchange["orderManager"]["setOrderProcessing"]).toBeCalledWith("123");
        expect(exchange.onReport).toBeCalledWith(expect.objectContaining({
            pair: pair,
            id: expect.any(String),
            updatedAt: expect.any(moment),
            type: OrderType.LIMIT,
            originalId: "123",
            quantity: 0.5,
            price: 0.002,
            reportType: ReportType.REPLACED,
        }));
    });
});

describe("cancelOrder", () => {
    test("Should cancel an order", () => {
        exchange["orderManager"]["setOrderProcessing"] = jest.fn();
        const onReportMock = jest.fn();
        exchange.onReport = onReportMock;
        exchange.cancelOrder({id: "123"} as IOrder);

        expect(onReportMock).toBeCalledWith({id: "123", reportType: ReportType.CANCELED});
        expect(exchange["orderManager"]["setOrderProcessing"]).toBeCalledWith("123");
    });
});

describe("createOrder", () => {
    test("Should create a new order", () => {
        exchange["currentCandle"] = {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: moment()} as ICandle;
        exchange["wallet"]["isOrderAllowed"] = jest.fn(() => true);
        exchange.onReport = jest.fn();

        const spyOrderProcessing = jest.spyOn(exchange.orderManager, "setOrderProcessing");
        exchange["createOrder"](pair, 10, 1, OrderSide.BUY);

        expect(exchange.onReport).toBeCalledWith(expect.objectContaining({
            createdAt: expect.any(moment),
            updatedAt: expect.any(moment),
            status: OrderStatus.NEW,
            timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
            id: expect.any(String),
            type: OrderType.LIMIT,
            reportType: ReportType.NEW,
            side: OrderSide.BUY,
            pair: pair,
            quantity: 1,
            price: 10,
        }));

        expect(spyOrderProcessing).toBeCalledWith(expect.any(String));
    });
});

describe("emitCandles", () => {
    test("Should emit a collection of candles", () => {
        const moment1 = moment();
        const moment2 = moment();
        const candle1 = {close: 1, high: 2, low: 0, open: 0, timestamp: moment1, volume: 10} as ICandle;
        const candle2 = {close: 1, high: 2, low: 0, open: 0, timestamp: moment2, volume: 10} as ICandle;

        const candles: ICandle[] = [candle1, candle2];
        exchange.emitCandles(candles);
        expect(emitMock).toBeCalledWith("core.updateCandles", expect.arrayContaining([candle1]));
        expect(emitMock).toBeCalledWith("core.updateCandles", expect.arrayContaining([candle1, candle2]));
    });

    test("Should emit oldest candles first", () => {
        const oldMoment = moment().subtract(5, "minutes");
        const newMoment = moment();
        const oldCandle = {close: 1, high: 2, low: 0, open: 0, timestamp: oldMoment, volume: 10} as ICandle;
        const newCandle = {close: 1, high: 2, low: 0, open: 0, timestamp: newMoment, volume: 10} as ICandle;

        const candles: ICandle[] = [oldCandle, newCandle];
        exchange.emitCandles(candles);
        expect(emitMock).toHaveBeenNthCalledWith(1, "core.updateCandles", expect.arrayContaining([oldCandle]));
        expect(emitMock).toHaveBeenNthCalledWith(2, "core.updateCandles", expect.arrayContaining([newCandle, oldCandle]));
        expect(exchange["currentCandle"]).toEqual(newCandle);
    });
});

describe("ready", () => {
    test("Should emit ready", () => {
        const isReady = exchange.isReady();
        expect(isReady).toEqual(true);
        expect(emitMock).toBeCalledWith("ready");
    });
});

describe("processOpenOrders", () => {
    test("Should not process candle older than order ", () => {
        const openOrder = {createdAt: moment(), id: "1234"} as IOrder;
        const setOpenOrders = jest.spyOn(exchange.orderManager, "setOpenOrders");
        exchange.orderManager.getOpenOrders = jest.fn(() => [openOrder]);

        exchange.processOpenOrders({timestamp: moment().subtract(1, "day")} as ICandle);

        expect(setOpenOrders).toBeCalledWith([openOrder]);
    });

    test("Should fill buy order if order price is higher than candle low", () => {
        const openOrder = {createdAt: moment(), price: 13.0, side: OrderSide.BUY} as IOrder;
        const setOpenOrders = jest.spyOn(exchange.orderManager, "setOpenOrders");
        const filledOrder = {...openOrder, reportType: ReportType.TRADE, status: OrderStatus.FILLED} as IOrder;
        exchange.orderManager.getOpenOrders = jest.fn(() => [openOrder]);
        exchange["onReport"] = jest.fn();

        exchange.processOpenOrders({open: 13, high: 20, low: 12, close: 14, timestamp: moment()} as ICandle);

        expect(setOpenOrders).toBeCalledWith([]);
        expect(exchange["filledOrders"]).toEqual([filledOrder]);
        expect(exchange["onReport"]).toBeCalledWith(filledOrder);
    });

    test("Should fill sell order if order price is lower than candle high", () => {
        const openOrder = {createdAt: moment(), price: 13.0, side: OrderSide.SELL} as IOrder;
        const setOpenOrders = jest.spyOn(exchange.orderManager, "setOpenOrders");
        const filledOrder = {...openOrder, reportType: ReportType.TRADE, status: OrderStatus.FILLED} as IOrder;
        exchange.orderManager.getOpenOrders = jest.fn(() => [openOrder]);
        exchange["onReport"] = jest.fn();

        exchange.processOpenOrders({open: 10, high: 14, low: 10, close: 11, timestamp: moment()} as ICandle);

        expect(setOpenOrders).toBeCalledWith([]);
        expect(exchange["filledOrders"]).toEqual([filledOrder]);
        expect(exchange["onReport"]).toBeCalledWith(filledOrder);
    });
});


