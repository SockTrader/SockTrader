/* tslint:disable */
import "jest";
import moment from "moment";
import HitBTCMapper, {IHitBTCCandlesResponse} from "../../sockTrader/core/exchanges/hitBTCMapper";
import HitBTC from "../../sockTrader/core/exchanges/hitBTC";

let exc = new HitBTC();
let mapper = new HitBTCMapper(exc);

beforeEach(() => {
    exc = new HitBTC();
    mapper = new HitBTCMapper(exc);
});

describe("mapCandles", () => {
    it("Should map exchange candles to internal ICandle array", () => {
        const candles = mapper["mapCandles"]({
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
        const onUpdateCandles = jest.fn();
        exc.currencies["BTCUSD"] = {id: ["BTC", "USD"], quantityIncrement: 0, tickSize: 0};
        exc.onUpdateCandles = onUpdateCandles;

        mapper.emit("api.updateCandles", {
            params: {period: "H1", symbol: "BTCUSD", data: []},
            method: "",
            jsonrpc: "",
        } as IHitBTCCandlesResponse);

        const [arg1, arg2, arg3, arg4] = onUpdateCandles.mock.calls[0];
        expect(arg1).toStrictEqual(["BTC", "USD"]);
        expect(arg2).toStrictEqual([]);
        expect(arg3).toStrictEqual({code: "H1", cron: "00 00 */1 * * *"});
        expect(arg4).toStrictEqual("update");
    });
});

describe("onReceive", () => {
    it("Should re-emit exchange events as API events", async () => {
        expect.assertions(1);

        mapper.on("api.event_method", args => {
            expect(args).toStrictEqual({
                id: "event_id",
                method: "event_method",
                randomData: [1, 2, "random", {}],
            });
        });

        mapper.onReceive({
            type: "utf8",
            utf8Data: JSON.stringify({
                method: "event_method",
                id: "event_id",
                randomData: [1, 2, "random", {}],
            }),
        });
    });

    it("Should throw when exchange emits non utf8 data", () => {
        expect(() => mapper.onReceive({type: "not_utf8"})).toThrowError("Response is not UTF8!");
    });
});

describe("destroy", () => {
    it("Should clean-up all bound event listeners", async () => {
        expect(mapper.eventNames()).toEqual([
            "api.snapshotCandles",
            "api.updateCandles",
            "api.snapshotOrderbook",
            "api.updateOrderbook",
            "api.report",
            "api.login",
            "api.getSymbols",
        ]);

        mapper.destroy();
        expect(mapper.eventNames()).toEqual([]);
    });
});

describe("onUpdateOrderbook", () => {
    it("Should trigger an orderbook update on the exchange", () => {
        const onUpdateOrderbook = jest.fn();
        exc.currencies["BTCUSD"] = {id: ["BTC", "USD"], quantityIncrement: 0, tickSize: 0};
        exc.onUpdateOrderbook = onUpdateOrderbook;

        mapper["onUpdateOrderbook"]({
            jsonrpc: "2.0",
            method: "string",
            params: {
                ask: [{price: 10, size: 10}],
                bid: [{price: 10, size: 10}],
                sequence: 1,
                symbol: "BTCUSD",
            },
        }, "addIncrement");

        const [arg1, arg2] = onUpdateOrderbook.mock.calls[0];
        expect(arg1).toEqual({
            ask: [{price: 10, size: 10}],
            bid: [{price: 10, size: 10}],
            pair: ["BTC", "USD"],
            sequence: 1,
        });
        expect(arg2).toEqual("addIncrement");
    });
});

describe("onLogin", () => {
    it("Should notify exchange when user is authenticated", () => {
        const isReadySpy = jest.spyOn(exc, "isReady");
        expect(exc["isAuthenticated"]).toStrictEqual(false);

        mapper["onLogin"]({id: "123", jsonrpc: "2.0", result: false});
        expect(exc["isAuthenticated"]).toStrictEqual(false);

        mapper["onLogin"]({id: "123", jsonrpc: "2.0", result: true});
        expect(exc["isAuthenticated"]).toStrictEqual(true);
        expect(isReadySpy).toBeCalledTimes(2);

    });
});

describe("onGetSymbols", () => {
    it("Should load currency configuration for exchange", () => {
        const currenciesLoadedSpy = jest.spyOn(exc, "onCurrenciesLoaded");
        mapper["onGetSymbols"]({
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
    it("Should load currency configuration for exchange", () => {
        const excReportSpy = jest.spyOn(exc, "onReport");
        exc["currencies"] = {
            "ETHBTC": {
                id: ["ETH", "BTC"],
                quantityIncrement: 0.001,
                tickSize: 0.000001,
            },
        };

        mapper["onReport"]({
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
                "createdAt": expect.anything(),
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
                "updatedAt": expect.anything(),
            })
        );
    });
});