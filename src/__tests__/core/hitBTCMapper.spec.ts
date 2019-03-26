/* tslint:disable */
import "jest";
import HitBTCMapper, {IHitBTCCandlesResponse} from "../../sockTrader/core/exchanges/hitBTCMapper";
import HitBTC from "../../sockTrader/core/exchanges/hitBTC";
import moment = require("moment");

describe("onUpdateCandles", () => {
    it("Should map exchange candle update to internal data structure", () => {
        const onUpdateCandles = jest.fn();
        const exch = new HitBTC();
        exch.currencies["BTCUSD"] = {id: ["BTC", "USD"], quantityIncrement: 0, tickSize: 0};
        exch.onUpdateCandles = onUpdateCandles;

        const mapper = new HitBTCMapper(exch);
        mapper.emit("api.updateCandles", {
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
        } as IHitBTCCandlesResponse);

        const [arg1, arg2, arg3, arg4] = onUpdateCandles.mock.calls[0];
        expect(arg1).toStrictEqual(["BTC", "USD"]);
        expect(arg2).toStrictEqual([{
            close: 9,
            high: 10,
            low: 9,
            open: 9,
            timestamp: expect.any(moment),
            volume: 1100,
        }]);
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
                randomData: [1,2,"random", {}]
            });
        });

        mapper.onReceive({
            type: "utf8",
            utf8Data: JSON.stringify({
                method: "event_method",
                id: "event_id",
                randomData: [1,2,"random", {}]
            })
        });
    });
});
