/* tslint:disable */
import "jest";
import moment, {Moment} from "moment";
import {Pair} from "../../sockTrader/core/types/pair";
import LocalExchange from "../../sockTrader/core/exchanges/localExchange";
import Wallet from "../../sockTrader/core/assets/wallet";
import {
    IOrder,
    OrderSide,
    OrderStatus,
    OrderTimeInForce,
    OrderType,
    ReportType,
} from "../../sockTrader/core/types/order";
import {ICandle} from "../../sockTrader/core/types/ICandle";

const pair: Pair = ["BTC", "USD"];

let wallet = new Wallet({BTC: 1});
let exchange = new LocalExchange(wallet);
let sendMock = jest.fn();
let emitMock = jest.fn();

beforeEach(() => {
    exchange = new LocalExchange(wallet);
    exchange.send = sendMock;
    exchange.emit = emitMock;
    exchange["isAdjustingAllowed"] = jest.fn(() => true);
});

afterEach(() => {
    sendMock.mockRestore();
    emitMock.mockRestore();
});

describe("getInstance", () => {
    test("Should trigger the onCreate lifecycle event", () => {
        const spyOnCreate = spyOn(LocalExchange.prototype, "onCreate");
        LocalExchange.getInstance(wallet);
        LocalExchange.getInstance(wallet);

        expect(spyOnCreate).toBeCalledTimes(1);
    });
});

describe("adjustOrder", () => {
    test("Should throw error with current candle undefined", () => {
        expect(() => exchange.adjustOrder(null as any, 10, 10))
            .toThrow("Current candle undefined. Emit candles before adjusting an order.");
    });

    test("Should adjust given order", () => {
        const setOrderInProgressMock = jest.fn();
        exchange["setOrderInProgress"] = setOrderInProgressMock;
        const onReportMock = jest.fn();
        exchange.onReport = onReportMock;
        const timeStamp: Moment = moment();
        exchange["currentCandle"] = {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: timeStamp} as ICandle;
        const generateOrderIdMock = jest.fn(() => "12345");
        exchange.generateOrderId = generateOrderIdMock;

        exchange.adjustOrder({pair: pair, id: "123"} as IOrder, 0.002, 0.5);
        expect(setOrderInProgressMock).toBeCalledWith("123");
        expect(onReportMock).toBeCalledWith(expect.objectContaining({
            pair: pair,
            id: "12345",
            updatedAt: timeStamp,
            type: OrderType.LIMIT,
            originalId: "123",
            quantity: 0.5,
            price: 0.002,
            reportType: ReportType.REPLACED,
        }));
        expect(generateOrderIdMock).toBeCalledWith(pair);

    });
});

describe("cancelOrder", () => {
    test("Should cancel an order", () => {
        const setOrderInProgressMock = jest.fn();
        exchange["setOrderInProgress"] = setOrderInProgressMock;
        const onReportMock = jest.fn();
        exchange.onReport = onReportMock;
        exchange.cancelOrder({id: "123"} as IOrder);

        expect(onReportMock).toBeCalledWith({id: "123", reportType: ReportType.CANCELED});
        expect(setOrderInProgressMock).toBeCalledWith("123");
    });
});

describe("createOrder", () => {
    test("Should create a new order", () => {
        const timeStamp: Moment = moment();
        exchange["currentCandle"] = {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: timeStamp} as ICandle;
        const isOrderAllowedMock = jest.fn(() => true);
        exchange["isOrderAllowed"] = isOrderAllowedMock;
        const onReportMock = jest.fn();
        exchange.onReport = onReportMock;
        const setOrderInProgressMock = jest.fn();
        exchange["setOrderInProgress"] = setOrderInProgressMock;
        const generateOrderIdMock = jest.fn(() => "12345");
        exchange.generateOrderId = generateOrderIdMock;
        exchange["createOrder"](pair, 10, 1, OrderSide.BUY);

        expect(generateOrderIdMock).toBeCalledWith(pair);

        expect(isOrderAllowedMock).toBeCalledWith(expect.objectContaining({
            createdAt: timeStamp,
            updatedAt: timeStamp,
            status: OrderStatus.NEW,
            timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
            id: "12345",
            type: OrderType.LIMIT,
            reportType: ReportType.NEW,
            side: OrderSide.BUY,
            pair: pair,
            quantity: 1,
            price: 10,
        }));

        expect(onReportMock).toBeCalledWith(expect.objectContaining({
            createdAt: timeStamp,
            updatedAt: timeStamp,
            status: OrderStatus.NEW,
            timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
            id: "12345",
            type: OrderType.LIMIT,
            reportType: ReportType.NEW,
            side: OrderSide.BUY,
            pair: pair,
            quantity: 1,
            price: 10,
        }));

        expect(setOrderInProgressMock).toBeCalledWith("12345");
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
        const earlierMoment = moment();
        const laterMoment = moment();
        const openOrder: IOrder = {
            createdAt: laterMoment,
            id: "1234",
            pair: pair,
            price: 13.0,
            quantity: 0.02,
        } as IOrder;
        exchange["openOrders"] = [openOrder];

        exchange.processOpenOrders({
            close: 1,
            high: 2,
            low: 0,
            open: 0,
            timestamp: earlierMoment,
            volume: 10,
        } as ICandle);
        expect(exchange.getOpenOrders()).toEqual([openOrder]);
    });

    test("Should fill buy order if buy price is higher than candle low", () => {
        const earlierMoment = moment();
        const laterMoment = moment();
        const openOrder: IOrder = {
            createdAt: earlierMoment,
            id: "1234",
            pair: pair,
            price: 13.0,
            quantity: 0.02,
            side: OrderSide.BUY,
        } as IOrder;
        exchange["openOrders"] = [openOrder];
        const onReportMock = jest.fn();
        exchange["onReport"] = onReportMock;

        exchange.processOpenOrders({
            close: 1,
            high: 2,
            low: 12.0,
            open: 0,
            timestamp: laterMoment,
            volume: 10,
        } as ICandle);
        expect(exchange.getOpenOrders()).toHaveLength(0);
        const filledOrder = {...openOrder, reportType: ReportType.TRADE, status: OrderStatus.FILLED} as IOrder;
        expect(exchange["filledOrders"]).toEqual([filledOrder]);
        expect(onReportMock).toBeCalledWith(filledOrder);
    });

    test("Should fill sell order if sell price is lower than candle high", () => {
        const earlierMoment = moment();
        const laterMoment = moment();
        const openOrder: IOrder = {
            createdAt: earlierMoment,
            id: "1234",
            pair: pair,
            price: 18.0,
            quantity: 0.02,
            side: OrderSide.SELL,
        } as IOrder;
        exchange["openOrders"] = [openOrder];
        const onReportMock = jest.fn();
        exchange["onReport"] = onReportMock;

        exchange.processOpenOrders({
            close: 1,
            high: 20,
            low: 12.0,
            open: 0,
            timestamp: laterMoment,
            volume: 10,
        } as ICandle);
        expect(exchange.getOpenOrders()).toHaveLength(0);
        const filledOrder = {...openOrder, reportType: ReportType.TRADE, status: OrderStatus.FILLED} as IOrder;
        expect(exchange["filledOrders"]).toEqual([filledOrder]);
        expect(onReportMock).toBeCalledWith(filledOrder);
    });
});

describe("isOrderAllowed", () => {
    test("Should check buy allowed on wallet", () => {
        const isBuyAllowedMock = jest.fn(() => false);
        exchange["wallet"]["isBuyAllowed"] = isBuyAllowedMock;

        const actualBuyAllowed = exchange["isOrderAllowed"]({side: OrderSide.BUY} as IOrder);
        expect(actualBuyAllowed).toBe(false);
        expect(isBuyAllowedMock).toBeCalledWith({side: OrderSide.BUY}, undefined);
    });

    test("Should check sell allowed on wallet", () => {
        const isSellAllowedMock = jest.fn(() => true);
        exchange["wallet"]["isSellAllowed"] = isSellAllowedMock;

        const actualBuyAllowed = exchange["isOrderAllowed"]({side: OrderSide.SELL} as IOrder);
        expect(actualBuyAllowed).toBe(true);
        expect(isSellAllowedMock).toBeCalledWith({side: OrderSide.SELL}, undefined);
    });
});
