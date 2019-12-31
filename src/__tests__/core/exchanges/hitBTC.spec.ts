import {Pair} from "../../../sockTrader/core/types/pair";
import HitBTC, {HitBTCCandleInterval} from "../../../sockTrader/core/exchanges/hitBTC";
import WsConnection from "../../../sockTrader/core/connection/wsConnection";
import Events from "../../../sockTrader/core/events";
import HitBTCCommand from "../../../sockTrader/core/exchanges/commands/hitBTCCommand";
import ExchangeFactory from "../../../sockTrader/core/exchanges/exchangeFactory";
import {FX_BTCUSD} from "../../../__fixtures__/currencies";
import {FX_ASK, FX_ASK_UPDATE, FX_BID, FX_BID_UPDATE} from "../../../__fixtures__/orderbook";
import Orderbook from "../../../sockTrader/core/orderbook/orderbook";

jest.mock("./../../../config");
jest.mock("./../../../sockTrader/core/connection/wsConnection");

process.env.SOCKTRADER_TRADING_MODE = "LIVE";

const pair: Pair = ["BTC", "USD"];

let exchange = new ExchangeFactory().createExchange("hitbtc") as HitBTC;
beforeEach(() => {
    (WsConnection as any).mockClear();
    exchange = new ExchangeFactory().createExchange("hitbtc") as HitBTC;
});

describe("HitBTCCandleInterval", () => {
    it("Should have all possible candle intervals defined", () => {
        expect(HitBTCCandleInterval.ONE_MINUTE).toEqual({code: "M1", cron: "00 */1 * * * *"});
        expect(HitBTCCandleInterval.THREE_MINUTES).toEqual({code: "M3", cron: "00 */3 * * * *"});
        expect(HitBTCCandleInterval.FIVE_MINUTES).toEqual({code: "M5", cron: "00 */5 * * * *"});
        expect(HitBTCCandleInterval.FIFTEEN_MINUTES).toEqual({code: "M15", cron: "00 */15 * * * *"});
        expect(HitBTCCandleInterval.THIRTY_MINUTES).toEqual({code: "M30", cron: "00 */30 * * * *"});
        expect(HitBTCCandleInterval.ONE_HOUR).toEqual({code: "H1", cron: "00 00 */1 * * *"});
        expect(HitBTCCandleInterval.FOUR_HOURS).toEqual({code: "H4", cron: "00 00 2,6,10,14,18,22 * * *"});
        expect(HitBTCCandleInterval.ONE_DAY).toEqual({code: "D1", cron: "00 00 00 */1 * *"});
        expect(HitBTCCandleInterval.SEVEN_DAYS).toEqual({code: "D7", cron: "00 00 00 */7 * *"});
        expect(HitBTCCandleInterval.ONE_MONTH).toEqual({code: "1M", cron: "00 00 00 00 */1 *"});
    });
});

describe("createConnection", () => {
    it("Should create a new websocket connection", () => {
        const connection = exchange["createConnection"]();
        expect(connection).toBeInstanceOf(WsConnection);
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
    it("Should authenticate user on exchange", () => {
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
        it("Should emit orderbook instance when new orderbook snapshot has been received", () => {
            const spy = jest.spyOn(Events, "emit");
            exchange.onSnapshotOrderbook({sequence: 2, pair, ask: FX_ASK, bid: FX_BID});
            expect(spy).toBeCalledWith("core.snapshotOrderbook", expect.any(Orderbook));
        });

        it("Should send snapshot to orderbook", () => {
            const spy = jest.spyOn(Orderbook.prototype, "setOrders");
            exchange.onSnapshotOrderbook({sequence: 2, pair, ask: FX_ASK, bid: FX_BID});
            expect(spy).toBeCalledWith(FX_ASK, FX_BID, 2);
        });
    });

    describe("onUpdateOrderbook", () => {
        it("Should emit orderbook instance when orderbook update has been received", () => {
            const spy = jest.spyOn(Events, "emit");
            exchange.onUpdateOrderbook({sequence: 2, pair, ask: FX_ASK_UPDATE, bid: FX_BID_UPDATE});
            expect(spy).toBeCalledWith("core.updateOrderbook", expect.any(Orderbook));
        });

        it("Should send increment to orderbook", () => {
            const spy = jest.spyOn(Orderbook.prototype, "addIncrement");
            exchange.onUpdateOrderbook({sequence: 2, pair, ask: FX_ASK_UPDATE, bid: FX_BID_UPDATE});
            expect(spy).toBeCalledWith(FX_ASK_UPDATE, FX_BID_UPDATE, 2);
        });
    });
});

describe("subscribeCandles", () => {
    it("Should send restorable subscribeCandles command to connection", () => {
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
    it("Should send restorable subscribeOrderbook command to connection", () => {
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
    it("Should send restorable subscribeReports command to connection", () => {
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
        exchange.login = jest.fn();
        exchange.loadCurrencies = jest.fn();
    });

    it("Should forward all messages to the adapter when connected", () => {
        const spy = jest.spyOn(exchange["connection"], "on");
        const onReceiveSpy = jest.spyOn(exchange["adapter"], "onReceive");

        exchange["onConnect"]();

        const [, callback] = spy.mock.calls[0];
        expect(spy).toBeCalledWith("message", expect.any(Function));

        callback(JSON.stringify({test: 123}));

        expect(onReceiveSpy).toBeCalledWith(JSON.stringify({test: 123}));
    });

    it("Should send command to load currency configuration", () => {
        exchange["onConnect"]();
        expect(exchange.loadCurrencies).toBeCalledTimes(1);
    });

    it("Should call login when connected", () => {
        exchange["onConnect"]();
        expect(exchange.login).toBeCalledTimes(1);
    });

    test.each([
        ["", "secret"], ["public", ""], ["", ""],
    ])("Should not call login when no credentials were given", (publicKey, secretKey) => {
        exchange["publicKey"] = publicKey;
        exchange["secretKey"] = secretKey;

        exchange["onConnect"]();
        expect(exchange.login).toBeCalledTimes(0);
    });
});
