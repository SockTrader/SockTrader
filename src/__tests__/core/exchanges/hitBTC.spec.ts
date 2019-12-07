import {Pair} from "../../../sockTrader/core/types/pair";
import HitBTC, {HitBTCCandleInterval} from "../../../sockTrader/core/exchanges/hitBTC";
import WebSocket from "../../../sockTrader/core/connection/webSocket";
import Events from "../../../sockTrader/core/events";
import HitBTCCommand from "../../../sockTrader/core/exchanges/commands/hitBTCCommand";
import ExchangeFactory from "../../../sockTrader/core/exchanges/exchangeFactory";
import {FX_BTCUSD} from "../../../__fixtures__/currencies";
import {FX_ASK, FX_ASK_UPDATE, FX_BID, FX_BID_UPDATE} from "../../../__fixtures__/orderbook";
import Orderbook from "../../../sockTrader/core/orderbook";

jest.mock("./../../../config");
jest.mock("./../../../sockTrader/core/connection/webSocket");

process.env.SOCKTRADER_TRADING_MODE = "LIVE";

const pair: Pair = ["BTC", "USD"];

let exchange = new ExchangeFactory().createExchange("hitbtc") as HitBTC;
beforeEach(() => {
    (WebSocket as any).mockClear();
    exchange = new ExchangeFactory().createExchange("hitbtc") as HitBTC;
});

describe("createConnection", () => {
    it("Should create a new websocket connection", () => {
        const connection = exchange["createConnection"]();
        expect(connection).toBeInstanceOf(WebSocket);
    });
});

describe("loadCurrencies", () => {
    it("Should load currency configuration from the exchange", () => {
        exchange.loadCurrencies();

        expect(exchange["connection"].send).toBeCalledWith(expect.any(HitBTCCommand));
        expect(exchange["connection"].send).toBeCalledWith({
            restorable: false,
            method: "getSymbols",
            params: {},
        });
    });
});

describe("login", () => {
    test("Should authenticate user on exchange", () => {
        exchange.login("PUB_123", "PRIV_123");

        expect(exchange["connection"].send).toBeCalledWith(expect.any(HitBTCCommand));
        expect(exchange["connection"].send).toBeCalledWith({
            restorable: true,
            method: "login",
            params: {
                algo: "HS256",
                pKey: "PUB_123",
                signature: expect.any(String),
                nonce: expect.any(String),
            },
        });
    });
});

describe("orderbook management", () => {
    beforeEach(() => {
        exchange.currencies = {BTCUSD: FX_BTCUSD};
        exchange.onSnapshotOrderbook({
            sequence: 1,
            pair,
            ask: FX_ASK,
            bid: FX_BID,
        });
    });

    describe("onSnapshotOrderbook", () => {
        test("Should emit orderbook instance when new orderbook snapshot has been received", () => {
            const spy = jest.spyOn(Events, "emit");
            exchange.onSnapshotOrderbook({sequence: 2, pair, ask: FX_ASK, bid: FX_BID});
            expect(spy).toBeCalledWith("core.snapshotOrderbook", expect.any(Orderbook));
        });

        test("Should send snapshot to orderbook", () => {
            const spy = jest.spyOn(Orderbook.prototype, "setOrders");
            exchange.onSnapshotOrderbook({sequence: 2, pair, ask: FX_ASK, bid: FX_BID});
            expect(spy).toBeCalledWith(FX_ASK, FX_BID, 2);
        });
    });

    describe("onUpdateOrderbook", () => {
        test("Should emit orderbook instance when orderbook update has been received", () => {
            const spy = jest.spyOn(Events, "emit");
            exchange.onUpdateOrderbook({sequence: 2, pair, ask: FX_ASK_UPDATE, bid: FX_BID_UPDATE});
            expect(spy).toBeCalledWith("core.updateOrderbook", expect.any(Orderbook));
        });

        test("Should send increment to orderbook", () => {
            const spy = jest.spyOn(Orderbook.prototype, "addIncrement");
            exchange.onUpdateOrderbook({sequence: 2, pair, ask: FX_ASK_UPDATE, bid: FX_BID_UPDATE});
            expect(spy).toBeCalledWith(FX_ASK_UPDATE, FX_BID_UPDATE, 2);
        });
    });
});

describe("subscribeCandles", () => {
    test("Should send restorable subscribeCandles command to connection", () => {
        exchange.subscribeCandles(pair, HitBTCCandleInterval.FIVE_MINUTES);

        expect(exchange["connection"].send).toBeCalledWith(expect.any(HitBTCCommand));
        expect(exchange["connection"].send).toBeCalledWith({
            restorable: true,
            method: "subscribeCandles",
            params: {period: "M5", symbol: "BTCUSD"},
        });
    });
});

describe("subscribeOrderbook", () => {
    test("Should send restorable subscribeOrderbook command to connection", () => {
        exchange.subscribeOrderbook(pair);

        expect(exchange["connection"].send).toBeCalledWith(expect.any(HitBTCCommand));
        expect(exchange["connection"].send).toBeCalledWith({
            restorable: true,
            method: "subscribeOrderbook",
            params: {symbol: "BTCUSD"},
        });
    });
});

describe("subscribeReports", () => {
    test("Should send restorable subscribeReports command to connection", () => {
        exchange.subscribeReports();

        expect(exchange["connection"].send).toBeCalledWith(expect.any(HitBTCCommand));
        expect(exchange["connection"].send).toBeCalledWith({
            restorable: true,
            method: "subscribeReports",
            params: {},
        });
    });
});

describe("onConnect", () => {
    beforeEach(() => {
        jest.resetModules();

        exchange.login = jest.fn();
        exchange.loadCurrencies = jest.fn();
    });

    test("Should forward all messages to the adapter when connected", () => {
        const spy = jest.spyOn(exchange["connection"], "on");
        const onReceiveSpy = jest.spyOn(exchange["adapter"], "onReceive");

        exchange["onConnect"]();

        const [,callback] = spy.mock.calls[0];
        expect(spy).toBeCalledWith("message", expect.any(Function));

        callback(JSON.stringify({test: 123}));

        expect(onReceiveSpy).toBeCalledWith(JSON.stringify({test: 123}));
    });

    test("Should send command to load currency configuration", () => {
        exchange["onConnect"]();
        expect(exchange.loadCurrencies).toBeCalledTimes(1);
    });

    test("Should call login when connected", () => {
        exchange["onConnect"]();
        expect(exchange.login).toBeCalledTimes(1);
    });

    test("Should not call login when no credentials were given", () => {
        exchange["publicKey"] = "";
        exchange["secretKey"] = "";

        exchange["onConnect"]();
        expect(exchange.login).toBeCalledTimes(0);
    });
});
