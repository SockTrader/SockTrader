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

process.env.SOCKTRADER_TRADING_MODE = "BACKTEST";

const pair: Pair = ["BTC", "USD"];

let exchange = new LocalExchange();
let emitMock = jest.fn();

beforeEach(() => {
    exchange = new LocalExchange();
    exchange.emit = emitMock;
});

afterEach(() => jest.clearAllMocks());

describe("cancelOrder", () => {
    test("Should cancel an order", () => {
        exchange["orderTracker"]["setOrderUnconfirmed"] = jest.fn();
        const onReportMock = jest.fn();
        exchange.onReport = onReportMock;
        exchange.cancelOrder({id: "123"} as IOrder);

        expect(onReportMock).toBeCalledWith({id: "123", reportType: ReportType.CANCELED});
        expect(exchange["orderTracker"]["setOrderUnconfirmed"]).toBeCalledWith("123");
    });
});

describe("createOrder", () => {
    test("Should create a new order", () => {
        // @formatter:off
        (exchange as any)["currentCandle"] = {open: 1,high: 2,low: 0,close: 1.5,volume: 1,timestamp: moment()} as ICandle;
        (exchange as any)["wallet"]["isOrderAllowed"] = jest.fn(() => true);
        // @formatter:on

        exchange.onReport = jest.fn();

        const spyOrderProcessing = jest.spyOn(exchange.orderTracker, "setOrderUnconfirmed");
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

        exchange.emitCandles([candle1, candle2] as ICandle[]);

        expect(exchange.emit).toBeCalledWith("core.updateCandles", expect.arrayContaining([candle1]));
        expect(exchange.emit).toBeCalledWith("core.updateCandles", expect.arrayContaining([candle1, candle2]));
    });

    test("Should emit oldest candles first", () => {
        const oldMoment = moment().subtract(5, "minutes");
        const newMoment = moment();
        const oldCandle = {close: 1, high: 2, low: 0, open: 0, timestamp: oldMoment, volume: 10} as ICandle;
        const newCandle = {close: 1, high: 2, low: 0, open: 0, timestamp: newMoment, volume: 10} as ICandle;

        exchange.emitCandles([oldCandle, newCandle] as ICandle[]);
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

describe("adjustOrder", () => {
    test("Should adjust order", () => {
        const spy = jest.spyOn(exchange, "onReport");
        exchange.adjustOrder({
            id: "123",
            pair: ["BTC", "USD"],
            price: 10,
            quantity: 1,
            side: OrderSide.BUY,
        } as IOrder, 100, 2);

        expect(spy).toBeCalledWith(expect.objectContaining({
            reportType: "replaced",
            originalId: "123",
            price: 100,
            quantity: 2,
        }));
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
