import {LoggerFactory} from "../../sockTrader/core/loggerFactory";

process.env.SOCKTRADER_TRADING_MODE = "BACKTEST";

describe("format", () => {
    it("Should format timestamp (coming from winston)",() => {
        const log = LoggerFactory["format"]({timestamp: "2020-01-11T15:20:11.698Z"});
        expect(log).toEqual("2020-01-11T15:20:11.698Z [BT] {\"type\":\"message\"}");
    });

    it("Should format JSON objects",() => {
        const log = LoggerFactory["format"]({message: {test: 123}});
        expect(log).toEqual("undefined [BT] {\"type\":\"message\",\"payload\":{\"test\":123}}");
    });

    it("Should format arrays",() => {
        const log = LoggerFactory["format"]({message: [1,2,3]});
        expect(log).toEqual("undefined [BT] {\"type\":\"message\",\"payload\":[1,2,3]}");
    });

    it("Should format boolean",() => {
        const log = LoggerFactory["format"]({message: true});
        expect(log).toEqual("undefined [BT] {\"type\":\"message\",\"payload\":true}");
    });

    it("Should format number",() => {
        const log = LoggerFactory["format"]({message: 123});
        expect(log).toEqual("undefined [BT] {\"type\":\"message\",\"payload\":123}");
    });

    it("Should format string",() => {
        const log = LoggerFactory["format"]({message: "123"});
        expect(log).toEqual("undefined [BT] {\"type\":\"message\",\"payload\":\"123\"}");
    });

    it("Should format (F)lux (S)tandard (A)ction (FSA)",() => {
        const log = LoggerFactory["format"]({message: {type: "test", payload: {test: 123}}});
        expect(log).toEqual("undefined [BT] {\"type\":\"test\",\"payload\":{\"test\":123}}");
    });
});

describe("getContext", () => {
    it("Should return [BT] when Backtest",() => {
        process.env.SOCKTRADER_TRADING_MODE = "BACKTEST";

        const context = LoggerFactory["getContext"]();
        expect(context).toEqual("[BT]");
    });

    it("Should return [PT] when Paper",() => {
        process.env.SOCKTRADER_TRADING_MODE = "PAPER";

        const context = LoggerFactory["getContext"]();
        expect(context).toEqual("[PT]");
    });

    it("Should return [LIVE] when Live",() => {
        process.env.SOCKTRADER_TRADING_MODE = "LIVE";

        const context = LoggerFactory["getContext"]();
        expect(context).toEqual("[LIVE]");
    });
});
