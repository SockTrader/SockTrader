import moment from "moment";
import {EventEmitter} from "events";
import {Pair} from "../../../sockTrader/core/types/pair";
import {
    IOrder,
    OrderSide,
    OrderStatus,
    OrderTimeInForce,
    OrderType,
    ReportType,
} from "../../../sockTrader/core/types/order";
import CandleManager from "../../../sockTrader/core/candles/candleManager";
import Orderbook from "../../../sockTrader/core/orderbook";
import MockExchange from "../../../sockTrader/core/exchanges/__mocks__/mockExchange";
import logger from "../../../sockTrader/core/logger";

jest.mock("../../../sockTrader/core/logger");

const pair: Pair = ["BTC", "USD"];

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

        exc.buy(pair, 1, 10);
        expect(createOrderMock).toBeCalled();
        expect(createOrderMock).toBeCalledWith(["BTC", "USD"], 1, 10, "buy");
    });
});

describe("sell", () => {
    test("Should create a sell order", () => {
        const createOrderMock = jest.fn();
        exc.createOrder = createOrderMock;

        exc.sell(pair, 1, 10);
        expect(createOrderMock).toBeCalled();
        expect(createOrderMock).toBeCalledWith(["BTC", "USD"], 1, 10, "sell");
    });
});

describe("getCandleManager", () => {
    test("Should return a cached candle manager for a trading pair", () => {
        const interval = {code: "D1", cron: "00 00 00 */1 * *"};
        const ob = exc.getCandleManager(pair, interval, () => {
        });
        expect(ob).toBeInstanceOf(CandleManager);
        expect(ob).not.toBe(new CandleManager(interval));

        const ob2 = exc.getCandleManager(pair, interval, () => {
        });
        expect(ob).toBe(ob2);
    });
});

describe("onReport", () => {
    test("Should add new order with report type NEW", () => {
        const addOpenOrder = jest.spyOn(exc.orderManager, "addOpenOrder");
        const report = getReport();
        exc.onReport({...report, reportType: ReportType.NEW});
        expect(addOpenOrder).toBeCalledWith(report);
    });

    test("Should replace existing order with report type REPLACED", () => {
        const findAndReplaceOrder = jest.spyOn(exc.orderManager, "findAndReplaceOpenOrder");
        const report = getReport();

        // @formatter:off
        exc.onReport({...report, reportType: ReportType.REPLACED, originalId: "123"});
        expect(findAndReplaceOrder).toBeCalledWith({...report, reportType: ReportType.REPLACED, originalId: "123"}, "123");
        // @formatter:on
    });

    test("Should remove filled order with report type TRADE", () => {
        const removeOpenOrder = jest.spyOn(exc.orderManager, "removeOpenOrder");
        const report = getReport();

        exc.onReport({...report, reportType: ReportType.TRADE, status: OrderStatus.FILLED});
        expect(removeOpenOrder).toBeCalledWith("123");
    });


    test("Should remove cancelled order with report type CANCELED", () => {
        const removeOpenOrder = jest.spyOn(exc.orderManager, "removeOpenOrder");
        const report = getReport();

        exc.onReport({...report, reportType: ReportType.CANCELED});
        expect(removeOpenOrder).toBeCalledWith("123");
    });

    test("Should remove invalid order with report type EXPIRED", () => {
        const removeOpenOrder = jest.spyOn(exc.orderManager, "removeOpenOrder");

        const report = getReport();

        exc.onReport({...report, reportType: ReportType.EXPIRED});
        expect(removeOpenOrder).toBeCalledWith("123");
    });

    test("Should remove order with report type SUSPENDED", () => {
        const removeOpenOrder = jest.spyOn(exc.orderManager, "removeOpenOrder");
        const report = getReport();

        exc.onReport({...report, reportType: ReportType.SUSPENDED});
        expect(removeOpenOrder).toBeCalledWith("123");
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

// @TODO @EXAMPLE! use these tests as an example!
describe("send", () => {
    test("Should send messages to a connection", () => {
        const command = exc.createCommand("test", {param1: "1", param2: "2"});
        exc.send(command);

        expect(exc["connection"].send).toBeCalledTimes(1);
        expect(exc["connection"].send).toBeCalledWith(command);
    });

    test("Should log error to error log when sending has failed", () => {
        const command = exc.createCommand("test", {param1: "1", param2: "2"});

        // @ts-ignore
        exc["connection"].send.mockImplementation(() => {
            throw new Error("Sending command failed");
        });

        exc.send(command);
        expect(logger.error).toBeCalledWith(new Error("Sending command failed"));
    });
});

describe("isAdjustingOrderAllowed", () => {
    test("Should disallow order in progress to be adjusted", () => {
        const order = getOrder();

        expect(exc["isAdjustingAllowed"](order, 0.002, 0.02)).toBe(true);
        expect(exc["isAdjustingAllowed"](order, 0.002, 0.02)).toBe(false);
    });

    test("Should disallow order to be adjusted when nothing changed", () => {
        const order = getOrder();
        expect(exc["isAdjustingAllowed"](order, 0.001263, 0.02)).toBe(false);
    });
});

describe("getOrderbook", () => {
    test("Should throw error if no configuration is found for given pair", () => {
        expect(() => exc.getOrderbook(pair)).toThrow("No configuration found for pair: \"BTCUSD\"");
    });

    test("Should get singleton exchange orderbook", () => {
        const symbol = pair.join("");

        exc.currencies[symbol] = {id: pair, quantityIncrement: 10, tickSize: 0.000001};

        // Returns a new empty orderbook
        const orderbook = exc.getOrderbook(pair);
        expect(orderbook).toEqual({pair, precision: 6, ask: [], bid: [], sequenceId: 0});
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
        expect(exc.currencies).toEqual({"BTCUSD": {id: ["BTC", "USD"], quantityIncrement: 10, tickSize: 100}});
        expect(exc.isCurrenciesLoaded).toBe(true);

        expect(isReadySpy).toBeCalledTimes(1);
    });
});
