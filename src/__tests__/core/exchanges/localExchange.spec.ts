import moment from "moment";
import Events from "../../../sockTrader/core/events";
import {ICandle} from "../../../sockTrader/core/types/ICandle";
import {isLocalExchange} from "../../../sockTrader/core/types/IExchange";
import {
    IOrder,
    OrderSide,
    OrderStatus,
    OrderTimeInForce,
    OrderType,
    ReportType,
} from "../../../sockTrader/core/types/order";
import {Pair} from "../../../sockTrader/core/types/pair";
import LocalOrderCreator from "../../../sockTrader/core/exchanges/orderCreators/localOrderCreator";
import ExchangeFactory from "../../../sockTrader/core/exchanges/exchangeFactory";
import LocalOrderFiller from "../../../sockTrader/core/exchanges/orderFillers/localOrderFiller";

process.env.SOCKTRADER_TRADING_MODE = "BACKTEST";

const pair: Pair = ["BTC", "USD"];
let exchange = new ExchangeFactory().createExchange();
let emitMock = jest.fn();

beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    exchange = new ExchangeFactory().createExchange();
    exchange.emit = emitMock;
});

describe("cancelOrder", () => {
    test("Should cancel an order", () => {
        const spyEmit = jest.spyOn(Events, "emit");
        exchange.cancelOrder({id: "123"} as IOrder);

        expect(spyEmit).toBeCalledWith("core.report", {id: "123", reportType: "canceled"}, undefined);
    });
});

describe("createOrder", () => {
    test("Should create a new order", () => {
        const spyEmit = jest.spyOn(Events, "emit");
        exchange.createOrder(pair, 10, 1, OrderSide.BUY);

        expect(spyEmit).toBeCalledWith("core.report", expect.objectContaining({
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
        }), undefined);
    });
});

describe("adjustOrder", () => {
    test("Should adjust order", () => {
        const spyEmit = jest.spyOn(Events, "emit");
        exchange.createOrder(["BTC", "USD"], 10, 1, OrderSide.BUY);
        exchange.adjustOrder({
            id: "2",
            pair: ["BTC", "USD"],
            price: 10,
            quantity: 1,
            side: OrderSide.BUY,
        } as IOrder, 100, 2);

        expect(spyEmit).toHaveBeenNthCalledWith(2, "core.report", expect.objectContaining({
            reportType: "new",
            status: "new",
            price: 10,
            quantity: 1,
        }), undefined);
        expect(spyEmit).toHaveBeenNthCalledWith(4, "core.report", expect.objectContaining({
            reportType: "replaced",
            price: 100,
            quantity: 2,
        }), undefined);
    });
});

describe("emitCandles", () => {
    beforeEach(() => {
        (exchange["orderFiller"] as LocalOrderFiller)["onProcessCandles"] = jest.fn();
    });

    test("Should send processedCandles to the orderFiller", () => {
        const spy = (exchange["orderFiller"] as LocalOrderFiller)["onProcessCandles"] = jest.fn();
        const candle1 = {close: 1, high: 0, low: 0, open: 0, timestamp: moment(), volume: 10} as ICandle;
        const candle2 = {close: 2, high: 0, low: 0, open: 0, timestamp: moment(), volume: 10} as ICandle;

        if (isLocalExchange(exchange)) exchange.emitCandles([candle1, candle2] as ICandle[]);

        expect(spy).toHaveBeenNthCalledWith(1, [candle1]);
        expect(spy).toHaveBeenNthCalledWith(2, [candle2, candle1]);
    });

    test("Should notify orderCreator about the current candle", () => {
        const spy = jest.spyOn(exchange["orderCreator"] as LocalOrderCreator, "setCurrentCandle");
        const candle1 = {close: 1, high: 0, low: 0, open: 0, timestamp: moment(), volume: 10} as ICandle;
        const candle2 = {close: 2, high: 0, low: 0, open: 0, timestamp: moment(), volume: 10} as ICandle;

        if (isLocalExchange(exchange)) exchange.emitCandles([candle1, candle2] as ICandle[]);

        expect(spy).toHaveBeenNthCalledWith(1, candle1);
        expect(spy).toHaveBeenNthCalledWith(2, candle2);
    });

    test("Should emit oldest candles first", () => {
        const spyEmit = jest.spyOn(Events, "emit");

        const newMoment = moment();
        const oldMoment = newMoment.subtract(5, "minutes");
        const oldCandle = {close: 1, high: 2, low: 0, open: 0, timestamp: oldMoment, volume: 10} as ICandle;
        const newCandle = {close: 1, high: 2, low: 0, open: 0, timestamp: newMoment, volume: 10} as ICandle;

        if (isLocalExchange(exchange)) exchange.emitCandles([oldCandle, newCandle] as ICandle[]);

        expect(spyEmit).toHaveBeenNthCalledWith(1, "core.updateCandles", expect.arrayContaining([oldCandle]));
        expect(spyEmit).toHaveBeenNthCalledWith(2, "core.updateCandles", expect.arrayContaining([newCandle, oldCandle]));
    });
});

describe("ready", () => {
    test("Should emit ready", () => {
        const isReady = exchange.isReady();
        expect(isReady).toEqual(true);
        expect(emitMock).toBeCalledWith("ready");
    });
});

describe("ignore methods on LocalExchange", () => {
    test("Should do nothing when 'onUpdateOrderbook' is triggered", () => {
        const result = exchange.onUpdateOrderbook(undefined as any);
        expect(result).toEqual(undefined);
    });

    test("Should do nothing when 'subscribeCandles' is triggered", () => {
        const result = exchange.subscribeCandles(undefined as any, undefined as any);
        expect(result).toEqual(undefined);
    });

    test("Should do nothing when 'subscribeOrderbook' is triggered", () => {
        const result = exchange.subscribeOrderbook(undefined as any);
        expect(result).toEqual(undefined);
    });

    test("Should do nothing when 'subscribeReports' is triggered", () => {
        const result = exchange.subscribeReports();
        expect(result).toEqual(undefined);
    });

    test("Should do nothing when 'loadCurrencies' is triggered", () => {
        const result = exchange["loadCurrencies"]();
        expect(result).toEqual(undefined);
    });
});
