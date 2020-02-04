import moment from "moment";
import HitBTCAdapter from "../../../sockTrader/core/exchange/hitBTCAdapter";
import {HitBTCCandlesResponse} from "../../../sockTrader/core/types/exchanges/hitBTCCandlesResponse";
import ExchangeFactory from "../../../sockTrader/core/exchange/exchangeFactory";
import {FX_BTCUSD, FX_ETHUSD} from "../../../__fixtures__/currencies";
import logger from "../../../sockTrader/core/loggerFactory";
import {FX_ASK, FX_BID} from "../../../__fixtures__/orderbook";
import HitBTC from "../../../sockTrader/core/exchange/hitBTC";

process.env.SOCKTRADER_TRADING_MODE = "LIVE";

function createExchange() {
    const exchange = new ExchangeFactory().createExchange("hitbtc") as HitBTC;
    exchange["currencies"] = {BTCUSD: FX_BTCUSD};

    return exchange;
}

let exchange: HitBTC;
let adapter: HitBTCAdapter;

beforeEach(() => {
    exchange = createExchange();
    adapter = new HitBTCAdapter(exchange);
});

describe("destroy", () => {
    it("Should clean-up all bound event listeners", () => {
        expect(adapter.eventNames()).toEqual([
            "api.snapshotCandles",
            "api.updateCandles",
            "api.snapshotOrderbook",
            "api.updateOrderbook",
            "api.report",
            "api.login",
            "api.getSymbols",
        ]);

        adapter.destroy();
        expect(adapter.eventNames()).toEqual([]);
    });
});

describe("onReceive", () => {
    it("Should emit raw exchange messages as internal API events", () => {
        const spy = jest.spyOn(adapter, "emit");

        adapter.onReceive(JSON.stringify({
            id: "event_id",
            method: "event_method",
            randomData: [1, 2, "random", {}],
        }));

        expect(spy).toBeCalledWith("api.event_method", {
            id: "event_id",
            method: "event_method",
            randomData: [1, 2, "random", {}],
        });
    });

    it("Should ignore incoming messages which are not strings", () => {
        const spyEmit = jest.spyOn(adapter, "emit");
        adapter.onReceive([]);
        adapter.onReceive(undefined as any);
        adapter.onReceive({} as any);
        expect(spyEmit).toBeCalledTimes(0);
    });
});

describe("mapCandles", () => {
    it("Should map exchange candle response to internal Candle array", () => {
        const candles = adapter["mapCandles"]({
            method: "", jsonrpc: "",
            params: {
                period: "H1", symbol: "BTCUSD",
                data: [{
                    max: "10",
                    min: "9",
                    close: "9",
                    open: "9",
                    timestamp: "2013-02-08 24:00:00.000",
                    volume: "1000", // BTC volume
                    volumeQuote: "1100", // USD volume
                }],
            },
        });

        expect(candles).toEqual([{
            open: 9, high: 10, low: 9, close: 9, timestamp: expect.any(moment), volume: 1100,
        }]);
    });
});

describe("onGetSymbols", () => {
    it("Should load currency configuration for exchange", () => {
        const spy = jest.spyOn(exchange, "onCurrenciesLoaded");
        adapter["onGetSymbols"]({
            id: "123",
            jsonrpc: "2.0",
            result: [{
                id: "ETHBTC",
                baseCurrency: "ETH",
                quoteCurrency: "BTC",
                quantityIncrement: "0.001",
                tickSize: "0.000001",
                takeLiquidityRate: "0.001",
                provideLiquidityRate: "-0.0001",
                feeCurrency: "BTC",
            }],
        });

        expect(spy).toBeCalledWith([{
            id: ["ETH", "BTC"],
            quantityIncrement: 0.001,
            tickSize: 0.000001,
        }]);
    });
});

describe("onLogin", () => {
    it("Should check if exchange is completely ready", () => {
        const spy = jest.spyOn(exchange, "isReady");

        adapter["onLogin"]({id: "123", jsonrpc: "2.0", result: true});
        expect(spy).toBeCalledTimes(1);
    });

    it("Should set exchange as authenticated based on server response", () => {
        adapter["onLogin"]({id: "123", jsonrpc: "2.0", result: false});
        expect(exchange.isAuthenticated).toEqual(false);

        adapter["onLogin"]({id: "123", jsonrpc: "2.0", result: true});
        expect(exchange.isAuthenticated).toEqual(true);
    });
});

describe("onReport", () => {
    it("Should report order to OrderTracker", () => {
        const spy = jest.spyOn(exchange.getOrderTracker(), "process");

        exchange["currencies"] = {ETHUSD: FX_ETHUSD};
        adapter["onReport"]({
            jsonrpc: "2.0",
            method: "method",
            params: [{
                id: "4345613661",
                clientOrderId: "57d5525562c945448e3cbd559bd068c3",
                symbol: "ETHUSD",
                side: "sell",
                status: "new",
                type: "limit",
                timeInForce: "GTC",
                quantity: "0.013",
                price: "0.100000",
                cumQuantity: "0.000",
                postOnly: false,
                createdAt: "2017-10-20T12:17:12.245Z",
                updatedAt: "2017-10-20T12:17:12.245Z",
                reportType: "status",
            }],
        });

        expect(spy).toBeCalledWith(
            expect.objectContaining({
                "createdAt": expect.any(moment),
                "id": "57d5525562c945448e3cbd559bd068c3",
                "originalId": undefined,
                "pair": ["ETH", "USD"],
                "price": 0.1,
                "quantity": 0.013,
                "reportType": "status",
                "side": "sell",
                "status": "new",
                "timeInForce": "GTC",
                "type": "limit",
                "updatedAt": expect.any(moment),
            }),
        );
    });
});

describe("getIntervalFromResponse", () => {
    it("Should convert HitBTCCandlesResponse to a CandleInterval", () => {
        const interval = adapter["getIntervalFromResponse"]({params: {period: "M1"}} as any);
        expect(interval).toEqual({code: "M1", cron: "00 */1 * * * *"});
    });

    it("Should return undefined if no interval could have been found", () => {
        const spy = jest.spyOn(logger, "warn");
        const interval = adapter["getIntervalFromResponse"]({params: {period: "UNDEFINED"}} as any);

        expect(interval).toEqual(undefined);
        expect(spy).toBeCalledWith("Interval: \"UNDEFINED\" is not recognized by the system.");
    });
});

describe("getPairFromResponse", () => {
    it("Should convert HitBTCCandlesResponse to a Pair", () => {
        const interval = adapter["getPairFromResponse"]({params: {symbol: "BTCUSD"}} as any);
        expect(interval).toEqual(["BTC", "USD"]);
    });
});

describe("onSnapshotCandles", () => {
    it("Should forward mapped snapshotCandles response to exchange", () => {
        exchange.onSnapshotCandles = jest.fn();

        adapter.emit("api.snapshotCandles", {
            params: {
                period: "H1",
                symbol: "BTCUSD",
                data: [{
                    max: "10",
                    min: "9",
                    close: "9",
                    open: "9",
                    timestamp: "2013-02-08 24:00:00.000",
                    volume: "1000", // BTC volume
                    volumeQuote: "1100", // USD volume
                }],
            },
            method: "",
            jsonrpc: "",
        } as HitBTCCandlesResponse);

        expect(exchange.onSnapshotCandles).toBeCalledWith(["BTC", "USD"], [
            {close: 9, high: 10, low: 9, open: 9, timestamp: expect.any(moment), volume: 1100},
        ], {code: "H1", cron: "00 00 */1 * * *"});
    });

    it("Should ignore a candle snapshot with an unrecognized interval", () => {
        exchange.onSnapshotCandles = jest.fn();
        adapter.emit("api.snapshotCandles", {params: {period: "UNKNOWN"}} as HitBTCCandlesResponse);
        expect(exchange.onSnapshotCandles).toBeCalledTimes(0);
    });
});

describe("onUpdateCandles", () => {
    it("Should forward mapped updateCandles response to exchange", () => {
        exchange.onUpdateCandles = jest.fn();

        adapter.emit("api.updateCandles", {
            params: {period: "H1", symbol: "BTCUSD", data: []},
            method: "",
            jsonrpc: "",
        } as HitBTCCandlesResponse);

        expect(exchange.onUpdateCandles).toBeCalledWith(["BTC", "USD"], [], {code: "H1", cron: "00 00 */1 * * *"});
    });

    it("Should ignore a candle update with an unrecognized interval", () => {
        exchange.onUpdateCandles = jest.fn();
        adapter.emit("api.snapshotCandles", {params: {period: "UNKNOWN"}} as HitBTCCandlesResponse);
        expect(exchange.onUpdateCandles).toBeCalledTimes(0);
    });
});

describe("onSnapshotOrderbook", () => {
    it("Should trigger an new orderbook snapshot on the exchange", () => {
        const spy = jest.spyOn(exchange, "onSnapshotOrderbook");
        adapter["onSnapshotOrderbook"]({
            jsonrpc: "2.0",
            method: "string",
            params: {
                ask: FX_ASK,
                bid: FX_BID,
                sequence: 1,
                symbol: "BTCUSD",
            },
        } as any);

        expect(spy).toBeCalledWith({
            ask: FX_ASK,
            bid: FX_BID,
            pair: ["BTC", "USD"],
            sequence: 1,
        });
    });
});

describe("onUpdateOrderbook", () => {
    it("Should trigger an orderbook update on the exchange", () => {
        const spy = jest.spyOn(exchange, "onUpdateOrderbook");
        adapter["onUpdateOrderbook"]({
            jsonrpc: "2.0",
            method: "string",
            params: {
                ask: FX_ASK,
                bid: FX_BID,
                sequence: 1,
                symbol: "BTCUSD",
            },
        } as any);

        expect(spy).toBeCalledWith({
            ask: FX_ASK,
            bid: FX_BID,
            pair: ["BTC", "USD"],
            sequence: 1,
        });
    });
});
