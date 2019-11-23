import moment from "moment";
import HitBTCAdapter from "../../../sockTrader/core/exchanges/hitBTCAdapter";
import HitBTC from "../../../sockTrader/core/exchanges/hitBTC";
import {IHitBTCCandlesResponse} from "../../../sockTrader/core/types/exchanges/IHitBTCCandlesResponse";
import OrderTrackerFactory from "../../../sockTrader/core/order/orderTrackerFactory";

process.env.SOCKTRADER_TRADING_MODE = "LIVE";

function createExchange() {
    const exchange = new HitBTC();
    exchange.onUpdateOrderbook = jest.fn();
    exchange.onUpdateCandles = jest.fn();
    exchange["currencies"] = {
        "BTCUSD": {id: ["BTC", "USD"], quantityIncrement: 0, tickSize: 0},
    };

    return exchange;
}

let exchange: any = createExchange();
let adapter: any = new HitBTCAdapter(exchange);

beforeEach(() => {
    exchange = createExchange();
    adapter = new HitBTCAdapter(exchange);
});

describe("mapCandles", () => {
    it("Should map exchange candles to internal ICandle array", () => {
        const candles = adapter["mapCandles"]({
            method: "", jsonrpc: "",
            params: {
                period: "H1", symbol: "BTCUSD",
                data: [
                    {
                        max: "10",
                        min: "9",
                        close: "9",
                        open: "9",
                        timestamp: "2013-02-08 24:00:00.000",
                        volume: "1000", // BTC volume
                        volumeQuote: "1100", // USD volume
                    },
                ],
            },
        });

        expect(candles).toEqual([{
            open: 9, high: 10, low: 9, close: 9, timestamp: expect.any(moment), volume: 1100,
        }]);
    });
});

describe("onUpdateCandles", () => {
    it("Should re-emit exchange candle update to internal api event", () => {
        adapter.emit("api.updateCandles", {
            params: {period: "H1", symbol: "BTCUSD", data: []},
            method: "",
            jsonrpc: "",
        } as IHitBTCCandlesResponse);

        const [arg1, arg2, arg3] = exchange.onUpdateCandles.mock.calls[0];
        expect(arg1).toStrictEqual(["BTC", "USD"]);
        expect(arg2).toStrictEqual([]);
        expect(arg3).toStrictEqual({code: "H1", cron: "00 00 */1 * * *"});
    });
});

describe("onReceive", () => {
    it("Should re-emit exchange events as API events", async () => {
        adapter.on("api.event_method", (args: any) => {
            expect(args).toStrictEqual({
                id: "event_id",
                method: "event_method",
                randomData: [1, 2, "random", {}],
            });
        });

        adapter.onReceive({
            type: "utf8",
            utf8Data: JSON.stringify({
                method: "event_method",
                id: "event_id",
                randomData: [1, 2, "random", {}],
            }),
        });
    });

    it("Should ignore incoming messages which are not strings", () => {
        const spyEmit = jest.spyOn(adapter, "emit");
        adapter.onReceive([]);
        adapter.onReceive(undefined);
        adapter.onReceive({});
        expect(spyEmit).toBeCalledTimes(0);
    });
});

describe("destroy", () => {
    it("Should clean-up all bound event listeners", async () => {
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

describe("onUpdateOrderbook", () => {
    it("Should trigger an orderbook update on the exchange", () => {
        adapter["onUpdateOrderbook"]({
            jsonrpc: "2.0",
            method: "string",
            params: {
                ask: [{price: 10, size: 10}],
                bid: [{price: 10, size: 10}],
                sequence: 1,
                symbol: "BTCUSD",
            },
        });

        const [arg1] = exchange.onUpdateOrderbook.mock.calls[0];
        expect(arg1).toEqual({
            ask: [{price: 10, size: 10}],
            bid: [{price: 10, size: 10}],
            pair: ["BTC", "USD"],
            sequence: 1,
        });
    });
});

describe("onLogin", () => {
    it("Should notify exchange when user is authenticated", () => {
        const isReadySpy = jest.spyOn(exchange, "isReady");
        expect(exchange["isAuthenticated"]).toStrictEqual(false);

        adapter["onLogin"]({id: "123", jsonrpc: "2.0", result: false});
        expect(exchange["isAuthenticated"]).toStrictEqual(false);

        adapter["onLogin"]({id: "123", jsonrpc: "2.0", result: true});
        expect(exchange["isAuthenticated"]).toStrictEqual(true);
        expect(isReadySpy).toBeCalledTimes(2);

    });
});

describe("onGetSymbols", () => {
    it("Should load currency configuration for exchange", () => {
        const currenciesLoadedSpy = jest.spyOn(exchange, "onCurrenciesLoaded");
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

        expect(currenciesLoadedSpy).toHaveBeenLastCalledWith([{
            "id": ["ETH", "BTC"],
            "quantityIncrement": 0.001,
            "tickSize": 0.000001,
        }]);
    });
});

describe("onReport", () => {
    it("Should report order to OrderTracker", () => {
        const orderTracker = OrderTrackerFactory.getInstance();
        const excReportSpy = jest.spyOn(orderTracker, "process");

        exchange["currencies"] = {
            "ETHBTC": {
                id: ["ETH", "BTC"],
                quantityIncrement: 0.001,
                tickSize: 0.000001,
            },
        };

        adapter["onReport"]({
            jsonrpc: "2.0",
            method: "method",
            params: [{
                id: "4345613661",
                clientOrderId: "57d5525562c945448e3cbd559bd068c3",
                symbol: "ETHBTC",
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

        expect(excReportSpy).toBeCalledWith(
            expect.objectContaining({
                "createdAt": expect.any(moment),
                "id": "57d5525562c945448e3cbd559bd068c3",
                "originalId": undefined,
                "pair": ["ETH", "BTC"],
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
