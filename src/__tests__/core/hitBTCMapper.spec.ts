/* tslint:disable */
import "jest";
import moment from "moment";
import HitBTCMapper, {IHitBTCCandlesResponse} from "../../sockTrader/core/exchanges/hitBTCMapper";
import HitBTC from "../../sockTrader/core/exchanges/hitBTC";

describe("mapCandles", () => {
    it("Should map exchange candles to internal ICandle array", () => {
        const exch = new HitBTC();
        const mapper = new HitBTCMapper(exch);
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
        const exch = new HitBTC();
        exch.currencies["BTCUSD"] = {id: ["BTC", "USD"], quantityIncrement: 0, tickSize: 0};
        exch.onUpdateCandles = onUpdateCandles;

        const mapper = new HitBTCMapper(exch);
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

        const exch = new HitBTC();
        const mapper = new HitBTCMapper(exch);
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
        const exch = new HitBTC();
        const mapper = new HitBTCMapper(exch);

        expect(() => mapper.onReceive({type: "not_utf8"})).toThrowError("Response is not UTF8!");
    });
});

describe("destroy", () => {
    it("Should clean-up all bound event listeners", async () => {
        const exch = new HitBTC();
        const mapper = new HitBTCMapper(exch);
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
        const exch = new HitBTC();
        exch.currencies["BTCUSD"] = {id: ["BTC", "USD"], quantityIncrement: 0, tickSize: 0};
        exch.onUpdateOrderbook = onUpdateOrderbook;

        const mapper = new HitBTCMapper(exch);
        mapper["onUpdateOrderbook"]({
            jsonrpc: "string",
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