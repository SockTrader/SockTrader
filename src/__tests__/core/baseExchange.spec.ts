/* tslint:disable */
import "jest";
import moment from "moment";
import {EventEmitter} from "events";
import {connection} from "websocket";
import {Socket} from "net";
import {Pair} from "../../sockTrader/core/types/pair";
import BaseExchange from "../../sockTrader/core/exchanges/baseExchange";
import {
    IOrder,
    OrderSide,
    OrderStatus,
    OrderTimeInForce,
    OrderType,
    ReportType,
} from "../../sockTrader/core/types/order";
import CandleCollection from "../../sockTrader/core/candleCollection";
import Orderbook from "../../sockTrader/core/orderbook";

const pair: Pair = ["BTC", "USD"];

// @ts-ignore
class MockExchange extends BaseExchange {
    public constructor() {
        super();
    }
}

let exc = new MockExchange();
const getReport = (): IOrder => ({
    id: "123",
    createdAt: moment(),
    price: 10,
    quantity: 0.5,
    reportType: ReportType.NEW,
    side: OrderSide.BUY,
    status: OrderStatus.NEW,
    pair: pair,
    timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
    type: OrderType.LIMIT,
    updatedAt: moment(),
});

const getOrder = (): IOrder => ({
    id: "4559a45057ded19e04d715c4b40f7ddd",
    createdAt: moment(),
    price: 0.001263,
    quantity: 0.02,
    reportType: ReportType.NEW,
    side: OrderSide.BUY,
    status: OrderStatus.NEW,
    pair: pair,
    timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
    type: OrderType.LIMIT,
    updatedAt: moment(),
});

beforeEach(() => {
    exc = new MockExchange();
});

describe("buy", () => {
    test("Should create a buy order", () => {
        const createOrderMock = jest.fn();
        exc.createOrder = createOrderMock;
        exc.generateOrderId = jest.fn();

        exc.buy(pair, 1, 10);
        expect(createOrderMock).toBeCalled();
        expect(createOrderMock).toBeCalledWith(["BTC", "USD"], 1, 10, "buy");
    });
});

describe("sell", () => {
    test("Should create a sell order", () => {
        const createOrderMock = jest.fn();
        exc.createOrder = createOrderMock;
        exc.generateOrderId = jest.fn();

        exc.sell(pair, 1, 10);
        expect(createOrderMock).toBeCalled();
        expect(createOrderMock).toBeCalledWith(["BTC", "USD"], 1, 10, "sell");
    });
});

describe("setOrderInProgress", () => {
    test("Should put an order in progress with state true", () => {
        const id = "ORDER_123";
        exc["setOrderInProgress"](id, true);
        expect(exc["orderInProgress"][id]).toBe(true);
    });

    test("Should put an order out of progress with state false", () => {
        const id = "ORDER_123";
        exc["setOrderInProgress"](id, false);
        expect(exc["orderInProgress"][id]).toBe(undefined);
    });
});

describe("getCandleCollection", () => {
    test("Should return a cached candle collection for a trading pair", () => {
        const interval = {code: "D1", cron: "00 00 00 */1 * *"};
        const ob = exc.getCandleCollection(pair, interval, () => {
        });
        expect(ob).toBeInstanceOf(CandleCollection);
        expect(ob).not.toBe(new CandleCollection(interval));

        const ob2 = exc.getCandleCollection(pair, interval, () => {
        });
        expect(ob).toBe(ob2);
    });
});

describe("onReport", () => {
    test("Should add new order with report type NEW", () => {
        const addOrder = jest.spyOn(exc, "addOrder" as any);
        const report = getReport();
        exc.onReport({...report, reportType: ReportType.NEW});
        expect(addOrder).toBeCalledWith(report);
    });

    test("Should replace existing order with report type REPLACED", () => {
        const addOrder = jest.spyOn(exc, "addOrder" as any);
        const removeOrder = jest.spyOn(exc, "removeOrder" as any);
        const setOrderInProgress = jest.spyOn(exc, "setOrderInProgress" as any);
        const report = getReport();

        exc.onReport({
            ...report,
            reportType: ReportType.REPLACED,
            originalId: "123",
            id: "321",
        });
        expect(setOrderInProgress).toBeCalledWith("123", false);
        expect(removeOrder).toBeCalledWith("123");
        expect(addOrder).toBeCalledWith({
            ...report,
            reportType: ReportType.REPLACED,
            originalId: "123",
            id: "321",
        });
    });

    test("Should remove filled order with report type TRADE", () => {
        const removeOrder = jest.spyOn(exc, "removeOrder" as any);
        const report = getReport();

        exc.onReport({...report, reportType: ReportType.TRADE, status: OrderStatus.FILLED});
        expect(removeOrder).toBeCalledWith("123");
    });


    test("Should remove cancelled order with report type CANCELED", () => {
        const removeOrder = jest.spyOn(exc, "removeOrder" as any);
        const report = getReport();

        exc.onReport({...report, reportType: ReportType.CANCELED});
        expect(removeOrder).toBeCalledWith("123");
    });

    test("Should remove invalid order with report type EXPIRED", () => {
        const removeOrder = jest.spyOn(exc, "removeOrder" as any);

        const report = getReport();

        exc.onReport({...report, reportType: ReportType.EXPIRED});
        expect(removeOrder).toBeCalledWith("123");
    });

    test("Should remove order with report type SUSPENDED", () => {
        const removeOrder = jest.spyOn(exc, "removeOrder" as any);
        const report = getReport();

        exc.onReport({...report, reportType: ReportType.SUSPENDED});
        expect(removeOrder).toBeCalledWith("123");
    });
});

describe("connect", () => {
    test("Should connect via a websocket connection string", () => {
        const spyOn = jest.spyOn(exc["socketClient"], "on");
        const spyConnect = jest.spyOn(exc["socketClient"], "connect");

        exc.connect("wss://my.fake.socket");

        expect(spyOn).toHaveBeenNthCalledWith(1, "connectFailed", expect.any(Function));
        expect(spyOn).toHaveBeenNthCalledWith(2, "connect", expect.any(Function));
        expect(spyConnect).toBeCalledWith("wss://my.fake.socket");
    });
});

describe("destroy", () => {
    test("Should remove all event listeners once the exchange is destroyed", () => {
        // This test should prevent memory leaks in an exchange.
        const spyRemoveListeners = jest.spyOn(exc, "removeAllListeners");

        exc.destroy();

        expect(exc).toBeInstanceOf(EventEmitter);
        expect(spyRemoveListeners).toBeCalled();
    });
});

describe("send", () => {
    test("Should send messages over a socket connection", () => {
        const mockSend = jest.fn();
        const mockConnection: connection = new connection(new Socket(), [], "protocl", true, {});

        mockConnection.send = mockSend;

        exc["connection"] = mockConnection as any;
        exc.send("test", {param1: "1", param2: "2"});

        const result = JSON.stringify({"method": "test", "params": {"param1": "1", "param2": "2"}, "id": "test"});
        expect(mockSend).toBeCalledWith(result);
    });

    test("Should throw error with connection undefined", () => {
        expect(() => exc.send("test_method", {param1: "param1", param2: "param2"}))
            .toThrow("First connect to the exchange before sending instructions..");
    });
});

describe("addOrder", () => {
    test("Should store all open orders", () => {
        const order = getOrder();
        expect(exc.getOpenOrders()).toHaveLength(0);

        exc["addOrder"](order);
        expect(exc.getOpenOrders()[0]).toEqual(order);
    });
});

describe("generateOrderId", () => {
    test("Should generate a random order id", () => {
        const orderId = exc["generateOrderId"](pair);
        expect(typeof orderId).toBe("string");
        expect(orderId).toHaveLength(32);
        expect(orderId).not.toBe(exc["generateOrderId"](pair));
    });
});

describe("isAdjustingOrderAllowed", () => {
    test("Should disallow order in progress to be adjusted", () => {
        const order = getOrder();

        expect(exc["isAdjustingOrderAllowed"](order, 0.002, 0.02)).toBe(true);
        expect(exc["isAdjustingOrderAllowed"](order, 0.002, 0.02)).toBe(false);
    });

    test("Should disallow order to be adjusted when nothing changed", () => {
        const order = getOrder();

        exc["orderInProgress"] = {};
        expect(exc["isAdjustingOrderAllowed"](order, 0.001263, 0.02)).toBe(false);
    });
});

describe("getOrderbook", () => {
    test("Should throw error if no configuration is found for given pair", () => {
        const symbol = pair.join("");

        expect(() => exc.getOrderbook(pair)).toThrow("No configuration found for pair: \"BTCUSD\"");
    });

    test("Should get singleton exchange orderbook", () => {
        const symbol = pair.join("");

        exc.currencies[symbol] = {id: pair, quantityIncrement: 10, tickSize: 0.000001};

        // Returns a new empty orderbook
        const orderbook = exc.getOrderbook(pair);
        expect(orderbook).toEqual({pair, precision: 6, ask: [], bid: []});
        expect(orderbook).toBeInstanceOf(Orderbook);
        expect(exc["orderbooks"][symbol]).toEqual(orderbook);

        const orderbook2 = exc.getOrderbook(pair);
        expect(orderbook2).toBe(orderbook);
    });
});

describe("onCurrenciesLoaded", () => {
    test("Should store currency configuration in Exchange", () => {
        const isReadySpy = jest.spyOn(exc, "isReady" as any);

        expect(exc.currencies).toEqual({});
        exc.onCurrenciesLoaded([{id: ["BTC", "USD"], quantityIncrement: 10, tickSize: 100}]);
        expect(exc.currencies).toEqual({ "BTCUSD": { id: ["BTC", "USD"], quantityIncrement: 10, tickSize: 100}});
        expect(exc.isCurrenciesLoaded).toBe(true);

        expect(isReadySpy).toBeCalledTimes(1);
    });
});