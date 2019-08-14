import {EventEmitter} from "events";
import {Pair} from "../../../sockTrader/core/types/pair";
import CandleManager from "../../../sockTrader/core/candles/candleManager";
import Orderbook from "../../../sockTrader/core/orderbook";
import MockExchange from "../../../sockTrader/core/exchanges/__mocks__/mockExchange";
import logger from "../../../sockTrader/core/logger";
import HitBTCCommand from "../../../sockTrader/core/exchanges/commands/hitBTCCommand";

jest.mock("../../../sockTrader/core/logger");

const pair: Pair = ["BTC", "USD"];

let exc = new MockExchange();
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
    test("Should send messages to a connection", () => {
        const command = new HitBTCCommand("test", {param1: "1", param2: "2"});
        exc.send(command);

        expect(exc["connection"].send).toBeCalledTimes(1);
        expect(exc["connection"].send).toBeCalledWith(command);
    });

    test("Should log error to error log when sending has failed", () => {
        const command = new HitBTCCommand("test", {param1: "1", param2: "2"});

        // @ts-ignore
        exc["connection"].send.mockImplementation(() => {
            throw new Error("Sending command failed");
        });

        exc.send(command);
        expect(logger.error).toBeCalledWith(new Error("Sending command failed"));
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
