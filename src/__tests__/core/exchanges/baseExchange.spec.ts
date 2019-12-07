import {Pair} from "../../../sockTrader/core/types/pair";
import Orderbook from "../../../sockTrader/core/orderbook";
import LocalExchange from "../../../sockTrader/core/exchanges/localExchange";
import ExchangeFactory from "../../../sockTrader/core/exchanges/exchangeFactory";
import {FX_NEW_BUY_ORDER} from "../../../__fixtures__/order";
import {OrderSide} from "../../../sockTrader/core/types/order";
import {FX_FILL_CANDLES} from "../../../__fixtures__/candles";
import {ALL_CURRENCIES, BTCUSD} from "../../../__fixtures__/currencies";

jest.mock("../../../sockTrader/core/logger");

const pair: Pair = ["BTC", "USD"];

let exchange = new ExchangeFactory().createExchange();
beforeEach(() => {
    exchange = new ExchangeFactory().createExchange();
});

describe("buy", () => {
    test("Should create a buy order", () => {
        const spy = jest.spyOn(LocalExchange.prototype, "createOrder");
        exchange.buy(["BTC", "USD"], 100, 1);
        expect(spy).toBeCalledWith(["BTC", "USD"], 100, 1, "buy");
    });
});

describe("sell", () => {
    test("Should create a sell order", () => {
        const spy = jest.spyOn(LocalExchange.prototype, "createOrder");
        exchange.sell(["BTC", "USD"], 100, 1);
        expect(spy).toBeCalledWith(["BTC", "USD"], 100, 1, "sell");
    });
});

describe("adjustOrder", () => {
    test("Should forward adjustOrder request to OrderCreator", () => {
        const spy = jest.spyOn(exchange["orderCreator"], "adjustOrder");
        exchange.adjustOrder(FX_NEW_BUY_ORDER, 100, 2);
        expect(spy).toBeCalledWith(FX_NEW_BUY_ORDER, 100, 2);
    });
});

describe("cancelOrder", () => {
    test("Should forward cancelOrder request to OrderCreator", () => {
        const spy = jest.spyOn(exchange["orderCreator"], "cancelOrder");
        exchange.cancelOrder(FX_NEW_BUY_ORDER);
        expect(spy).toBeCalledWith(FX_NEW_BUY_ORDER);
    });
});

describe("createOrder", () => {
    test("Should forward createOrder request to OrderCreator", () => {
        const spy = jest.spyOn(exchange["orderCreator"], "createOrder");
        exchange.createOrder(["BTC", "USD"], 100, 1, OrderSide.BUY);
        expect(spy).toBeCalledWith(["BTC", "USD"], 100, 1, OrderSide.BUY);
    });
});

describe("onSnapshotCandles", () => {
    test("Should forward onSnapshotCandles request to OrderFiller", () => {
        const spy = jest.spyOn(exchange["orderFiller"], "onSnapshotCandles");
        exchange.onSnapshotCandles(["BTC", "USD"], FX_FILL_CANDLES, {code: "code", cron: "*"});
        expect(spy).toBeCalledWith(["BTC", "USD"], FX_FILL_CANDLES, {code: "code", cron: "*"});
    });
});

describe("onUpdateCandles", () => {
    test("Should forward onUpdateCandles request to OrderFiller", () => {
        const spy = jest.spyOn(exchange["orderFiller"], "onUpdateCandles");
        exchange.onUpdateCandles(["BTC", "USD"], FX_FILL_CANDLES, {code: "code", cron: "*"});
        expect(spy).toBeCalledWith(["BTC", "USD"], FX_FILL_CANDLES, {code: "code", cron: "*"});
    });
});

describe("destroy", () => {
    test("Should remove all event listeners once the exchange is destroyed", () => {
        const spy1 = jest.spyOn(exchange, "removeAllListeners");
        const spy2 = jest.spyOn(exchange["connection"], "removeAllListeners");

        exchange.destroy();

        expect(spy1).toBeCalled();
        expect(spy2).toBeCalled();
    });
});

describe("connect", () => {
    test("Should call connect on connection", () => {
        const spy = jest.spyOn(exchange["connection"], "connect");

        exchange.connect();

        expect(spy).toBeCalledTimes(1);
    });

    test("Should trigger onConnect event in exchange once connected", () => {
        const spy = jest.spyOn(exchange as any, "onConnect");

        exchange.connect();

        expect(spy).toBeCalledTimes(1);
    });

    test("Should trigger onReconnect event in exchange when reconnected", () => {
        const spy1 = jest.spyOn(exchange as any, "onConnect");
        const spy2 = jest.spyOn(exchange as any, "onReconnect");

        exchange.connect();
        exchange["connection"].emit("open");
        exchange["connection"].emit("open");

        expect(spy1).toBeCalledTimes(1);
        expect(spy2).toBeCalledTimes(2);
    });
});

// @TODO test needs to be refactored into orderbook factory
describe.skip("getOrderbook", () => {
    test("Should throw error if no configuration is found for given pair", () => {
        expect(() => exchange.getOrderbook(pair)).toThrow("No configuration found for pair: \"BTCUSD\"");
    });

    test("Should get singleton exchange orderbook", () => {
        const symbol = pair.join("");

        exchange.currencies[symbol] = BTCUSD;

        // Returns a new empty orderbook
        const orderbook = exchange.getOrderbook(pair);
        expect(orderbook).toEqual({pair, precision: 2, ask: [], bid: [], sequenceId: 0});
        expect(orderbook).toBeInstanceOf(Orderbook);
        expect(exchange["orderbooks"][symbol]).toEqual(orderbook);

        const orderbook2 = exchange.getOrderbook(pair);
        expect(orderbook2).toBe(orderbook);
    });
});

describe("isReady", () => {
    test("Should emit ready event once", () => {
        const spy = jest.spyOn(exchange, "emit");

        exchange.isReady();
        exchange.isReady();

        expect(spy).toBeCalledTimes(1);
    });

    test.each([
        [true, false, false],
        [false, true, false],
        [true, true, true],
    ])("Should be ready when currencies are loaded and user is authenticated", (currencies, authenticated, result) => {
        exchange.isCurrenciesLoaded = currencies;
        exchange.isAuthenticated = authenticated;

        expect(exchange.isReady()).toEqual(result);
    });
});

describe("onCurrenciedLoaded", () => {
    test("Should store currency configuration in Exchange", () => {
        const isReadySpy = jest.spyOn(exchange, "isReady");

        expect(exchange.currencies).toEqual({});
        exchange.onCurrenciesLoaded(ALL_CURRENCIES);
        expect(exchange.currencies).toEqual(expect.objectContaining({
            BTCUSD: {
                id: ["BTC", "USD"],
                quantityIncrement: 0.00001,
                tickSize: 0.01,
            },
            ETHUSD: {
                id: ["ETH", "USD"],
                quantityIncrement: 0.0001,
                tickSize: 0.001,
            },
        }));
        expect(exchange.isCurrenciesLoaded).toBe(true);
        expect(isReadySpy).toBeCalledTimes(1);
    });
});
