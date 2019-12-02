import {Pair} from "../../../sockTrader/core/types/pair";
import HitBTC, {HitBTCCandleInterval} from "../../../sockTrader/core/exchanges/hitBTC";
import WebSocket from "../../../sockTrader/core/connection/webSocket";
import Events from "../../../sockTrader/core/events";
import HitBTCCommand from "../../../sockTrader/core/exchanges/commands/hitBTCCommand";
import LocalOrderFiller from "../../../sockTrader/core/exchanges/orderFillers/localOrderFiller";
import OrderTracker from "../../../sockTrader/core/order/orderTracker";
import Wallet from "../../../sockTrader/core/plugins/wallet/wallet";
import LocalOrderCreator from "../../../sockTrader/core/exchanges/orderCreators/localOrderCreator";

jest.mock("./../../../config");
jest.mock("./../../../sockTrader/core/connection/webSocket");

process.env.SOCKTRADER_TRADING_MODE = "LIVE";

const pair: Pair = ["BTC", "USD"];

let exchange = new HitBTC();
beforeEach(() => {
    (WebSocket as any).mockClear();
    exchange = new HitBTC();
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

        const arg1 = (exchange["connection"].send as any).mock.calls[0][0] as HitBTCCommand;
        expect(arg1).toBeInstanceOf(HitBTCCommand);
        expect(arg1).toEqual({
            restorable: false,
            method: "getSymbols",
            params: {},
        });
    });
});

describe("login", () => {
    test("Should authenticate user on exchange", () => {
        exchange.login("PUB_123", "PRIV_123");

        const arg1 = (exchange["connection"].send as any).mock.calls[0][0] as HitBTCCommand;
        expect(arg1).toBeInstanceOf(HitBTCCommand);
        expect(arg1).toEqual({
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
        exchange.currencies = {BTCUSD: {id: ["BTC", "USD"], quantityIncrement: 0.001, tickSize: 0.000001}};
        exchange.onSnapshotOrderbook({
            sequence: 1,
            pair,
            ask: [{price: 0.0015, size: 100}],
            bid: [{price: 0.001391, size: 40}],
        });
    });

    describe("onSnapshotOrderbook", () => {
        test("Should emit incremental changes", () => {
            const emitSpy = jest.spyOn(Events, "emit");
            exchange.onSnapshotOrderbook({
                sequence: 2,
                pair,
                ask: [{price: 0.0025, size: 100}],
                bid: [{price: 0.002391, size: 40}],
            });

            expect(emitSpy).toBeCalledWith("core.snapshotOrderbook", {
                sequenceId: 2,
                precision: 6,
                pair: ["BTC", "USD"],
                ask: [{price: 0.0025, size: 100}],
                bid: [{price: 0.002391, size: 40}],
            });
        });
    });

    describe("onUpdateOrderbook", () => {
        test("Should emit incremental changes", () => {
            const emitSpy = jest.spyOn(Events, "emit");

            exchange.onUpdateOrderbook({
                sequence: 2,
                pair,
                ask: [{price: 0.0015, size: 0}, {price: 0.0016, size: 10}],
                bid: [{price: 0.001391, size: 50}],
            });

            expect(emitSpy).toBeCalledWith("core.updateOrderbook", {
                sequenceId: 2,
                precision: 6,
                pair: ["BTC", "USD"],
                ask: [{price: 0.0016, size: 10}],
                bid: [{price: 0.001391, size: 50}],
            });
        });
    });
});

describe("subscribeCandles", () => {
    test("Should send out subscribe to candle events", () => {
        exchange.subscribeCandles(pair, HitBTCCandleInterval.FIVE_MINUTES);

        const arg1 = (exchange["connection"].send as any).mock.calls[0][0] as HitBTCCommand;
        expect(arg1).toBeInstanceOf(HitBTCCommand);
        expect(arg1).toEqual({
            restorable: true,
            method: "subscribeCandles",
            params: {period: "M5", symbol: "BTCUSD"},
        });
    });
});

describe("subscribeOrderbook", () => {
    test("Should send out a subscribe to orderbook events", () => {
        exchange.subscribeOrderbook(pair);

        const arg1 = (exchange["connection"].send as any).mock.calls[0][0] as HitBTCCommand;
        expect(arg1).toBeInstanceOf(HitBTCCommand);
        expect(arg1).toEqual({
            restorable: true,
            method: "subscribeOrderbook",
            params: {symbol: "BTCUSD"},
        });
    });
});

describe("subscribeReports", () => {
    test("Should send out a subscribe to report events", () => {
        exchange.subscribeReports();

        const arg1 = (exchange["connection"].send as any).mock.calls[0][0] as HitBTCCommand;
        expect(arg1).toBeInstanceOf(HitBTCCommand);
        expect(arg1).toEqual({
            restorable: true,
            method: "subscribeReports",
            params: {},
        });
    });
});

describe("onConnect", () => {
    test("Should initialize when exchange is connected", () => {
        exchange.login = jest.fn();
        exchange.loadCurrencies = jest.fn();

        const onSpy = jest.spyOn(exchange["connection"], "on");
        const onReceiveSpy = jest.spyOn(exchange["adapter"], "onReceive");

        exchange["onConnect"]();

        const [arg1, arg2] = onSpy.mock.calls[0];
        expect(arg1).toEqual("message");
        expect(arg2).toBeInstanceOf(Function);

        arg2(JSON.stringify({test: 123}));

        expect(onReceiveSpy).toBeCalledWith(JSON.stringify({test: 123}));
        expect(exchange.loadCurrencies).toBeCalledTimes(1);
        expect(exchange.login).toBeCalledWith("pub_key", "sec_key");
    });
});

describe("setCandleProcessor", () => {
    test("Should be able to set an orderFiller instance", () => {
        const orderFiller = new LocalOrderFiller(new OrderTracker(), new Wallet({}));
        exchange["setCandleProcessor"](orderFiller);
        expect(exchange["orderFiller"]).toBeInstanceOf(LocalOrderFiller);
    });
});

describe("getOrderCreator", () => {
    test("Should be able to set an orderCreator instance", () => {
        const orderCreator = new LocalOrderCreator(new OrderTracker(), new Wallet({}));
        exchange["setOrderCreator"](orderCreator);
        expect(exchange["orderCreator"]).toBeInstanceOf(LocalOrderCreator);
    });
});
