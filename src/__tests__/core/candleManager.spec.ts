import sinon from "sinon";
import CandleManager from "../../sockTrader/core/candles/candleManager";
import moment, {Moment} from "moment";
import {Candle} from "../../sockTrader/core/types/candle";

const start = moment().seconds(0).millisecond(0).subtract(7, "minutes");
const convertTimestamp = (candles: any) => candles.map((c: any) => ({...c, timestamp: c.timestamp.toArray()}));
const getTime = (start: Moment, action = "+", minutes = 0): Moment => {
    const method = (action === "+") ? "add" : "subtract";
    return start.clone()[method](minutes, "minutes");
};

let cm: any;
beforeEach(() => {
    cm = new CandleManager({code: "M1", cron: "00 */1 * * * *"}, false);
});

describe("candleEqualsTimestamp", () => {
    it("Should return true if candle time is same or newer than the timestamp", () => {
        const result1 = cm["candleEqualsTimestamp"]({timestamp: moment()} as Candle, moment());
        const result2 = cm["candleEqualsTimestamp"]({timestamp: moment().add(5, "minutes")} as Candle, moment());
        expect(result1).toEqual(true);
        expect(result2).toEqual(true);
    });

    it("Should return false if candle time is older than the timestamp", () => {
        const result = cm["candleEqualsTimestamp"]({timestamp: moment()} as Candle, moment().add(5, "minutes"));
        expect(result).toEqual(false);
    });
});
describe("CandleManager", () => {
    it("Should sort all candles, with the latest candle first and the last candle last", () => {
        const cc = new CandleManager({code: "M1", cron: "00 */1 * * * *"}, false);
        const candles = cc.sort([
            {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: start.clone()},
            {open: 2, high: 4, low: 2, close: 3, volume: 10, timestamp: start.clone().add(5, "minutes")},
            {open: 1.5, high: 3, low: 1, close: 2, volume: 5, timestamp: start.clone().add(1, "day")},
        ]);

        expect(candles).toEqual([
            {open: 1.5, high: 3, low: 1, close: 2, volume: 5, timestamp: start.clone().add(1, "day")},
            {open: 2, high: 4, low: 2, close: 3, volume: 10, timestamp: start.clone().add(5, "minutes")},
            {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: start.clone()},
        ]);
    });
});

describe("update", () => {
    it("Should remove oldest candle when retention period is met", () => {
        const start = moment().seconds(0).millisecond(0);
        const results: any = [];

        // @TODO fix bug when retentionPeriod = 1
        const cc = new CandleManager({code: "M1", cron: "00 */1 * * * *"}, false, 2);
        cc.on("update", (candles: Candle[]) => results.push(convertTimestamp(candles)));

        cc.set([{open: 1, high: 2, low: 1, close: 1.5, volume: 1, timestamp: getTime(start, "-", 1)}]);
        cc.update([{open: 1, high: 3, low: 0, close: 3, volume: 2, timestamp: getTime(start, "+", 1)}]);
        cc.update([{open: 3, high: 4, low: 2, close: 3.5, volume: 1, timestamp: getTime(start, "+", 2)}]);

        expect(results).toEqual([
            [
                {open: 1.5, high: 1.5, low: 1.5, close: 1.5, volume: 0, timestamp: getTime(start).toArray()},
                {open: 1, high: 2, low: 1, close: 1.5, volume: 1, timestamp: getTime(start, "-", 1).toArray()},
            ],
            [
                {open: 1, high: 3, low: 0, close: 3, volume: 2, timestamp: getTime(start, "+", 1).toArray()},
                {open: 1.5, high: 1.5, low: 1.5, close: 1.5, volume: 0, timestamp: getTime(start).toArray()},
            ],
            [
                {open: 3, high: 4, low: 2, close: 3.5, volume: 1, timestamp: getTime(start, "+", 2).toArray()},
                {open: 1, high: 3, low: 0, close: 3, volume: 2, timestamp: getTime(start, "+", 1).toArray()},
            ],
        ]);
    });

    it("Should update the candle manager", () => {
        const start = moment().seconds(0).millisecond(0);
        const results: any = [];

        const cc = new CandleManager({code: "M1", cron: "00 */1 * * * *"}, false);
        cc.on("update", (candles: Candle[]) => results.push(convertTimestamp(candles)));

        cc.set([{open: 1, high: 2, low: 1, close: 1.5, volume: 1, timestamp: getTime(start, "-", 1)}]);
        cc.update([{open: 1, high: 3, low: 0, close: 3, volume: 2, timestamp: getTime(start, "+", 1)}]);
        cc.update([{open: 1, high: 4, low: 0, close: 3.5, volume: 3, timestamp: getTime(start, "+", 1)}]);

        expect(results).toEqual([
            [
                {open: 1.5, high: 1.5, low: 1.5, close: 1.5, volume: 0, timestamp: getTime(start).toArray()},
                {open: 1, high: 2, low: 1, close: 1.5, volume: 1, timestamp: getTime(start, "-", 1).toArray()},
            ],
            [
                {open: 1, high: 3, low: 0, close: 3, volume: 2, timestamp: getTime(start, "+", 1).toArray()},
                {open: 1.5, high: 1.5, low: 1.5, close: 1.5, volume: 0, timestamp: getTime(start).toArray()},
                {open: 1, high: 2, low: 1, close: 1.5, volume: 1, timestamp: getTime(start, "-", 1).toArray()},
            ],
            [
                {open: 1, high: 4, low: 0, close: 3.5, volume: 3, timestamp: getTime(start, "+", 1).toArray()},
                {open: 1.5, high: 1.5, low: 1.5, close: 1.5, volume: 0, timestamp: getTime(start).toArray()},
                {open: 1, high: 2, low: 1, close: 1.5, volume: 1, timestamp: getTime(start, "-", 1).toArray()},
            ],
        ]);
    });

    it("Should fill all candle gaps until last interval occurrence before current time", () => {
        const cc = new CandleManager({code: "M1", cron: "00 */1 * * * *"}, false);
        cc.on("update", (candles: Candle[]) => {
            expect(convertTimestamp(candles)).toEqual([
                {open: 3, high: 3, low: 3, close: 3, volume: 0, timestamp: getTime(start, "+", 7).toArray()},
                {open: 3, high: 3, low: 3, close: 3, volume: 0, timestamp: getTime(start, "+", 6).toArray()},
                {open: 2, high: 4, low: 2, close: 3, volume: 10, timestamp: getTime(start, "+", 5).toArray()},
                {open: 2, high: 2, low: 2, close: 2, volume: 0, timestamp: getTime(start, "+", 4).toArray()},
                {open: 2, high: 2, low: 2, close: 2, volume: 0, timestamp: getTime(start, "+", 3).toArray()},
                {open: 2, high: 2, low: 2, close: 2, volume: 0, timestamp: getTime(start, "+", 2).toArray()},
                {open: 1.5, high: 3, low: 1, close: 2, volume: 5, timestamp: getTime(start, "+", 1).toArray()},
                {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: getTime(start, "+").toArray()},
            ]);
        });

        cc.set([
            {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: start.clone()},
            {open: 2, high: 4, low: 2, close: 3, volume: 10, timestamp: start.clone().add(5, "minutes")},
            {open: 1.5, high: 3, low: 1, close: 2, volume: 5, timestamp: start.clone().add(1, "minutes")},
        ]);
    });

    it("Should automatically generate new candles", () => {
        const start = moment().seconds(0).millisecond(0);
        const clock = sinon.useFakeTimers(new Date());
        const results: any = [];

        const cc = new CandleManager({code: "M1", cron: "00 */1 * * * *"}, true);
        cc.on("update", (candles: Candle[]) => results.push(convertTimestamp(candles)));

        // Generate new empty candle
        clock.tick("01:00");

        // Overwrite previous candles by using "set"
        cc.set([{open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: start.clone().add(1, "minutes")}]);

        // Generate a new candle based on the previous one
        clock.tick("01:00");

        cc.stop();
        expect(results).toEqual([
            [{open: 0, high: 0, low: 0, close: 0, volume: 0, timestamp: getTime(start, "+", 1).toArray()}],
            [{open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: getTime(start, "+", 1).toArray()}],
            [
                {open: 1.5, high: 1.5, low: 1.5, close: 1.5, volume: 0, timestamp: getTime(start, "+", 2).toArray()},
                {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: getTime(start, "+", 1).toArray()},
            ],
        ]);

        clock.restore();
    });
});

describe("fillCandleGaps", () => {
    it("Should fill all candle gaps until retention period is met", () => {
        const cc = new CandleManager({code: "M1", cron: "00 */1 * * * *"}, false, 3);
        cc.on("update", (candles: Candle[]) => {
            expect(convertTimestamp(candles)).toEqual([
                {open: 3, high: 3, low: 3, close: 3, volume: 0, timestamp: getTime(start, "+", 7).toArray()},
                {open: 3, high: 3, low: 3, close: 3, volume: 0, timestamp: getTime(start, "+", 6).toArray()},
                {open: 2, high: 4, low: 2, close: 3, volume: 10, timestamp: getTime(start, "+", 5).toArray()},
            ]);
        });

        cc.set([
            {open: 1, high: 2, low: 0, close: 1.5, volume: 1, timestamp: start.clone()},
            {open: 2, high: 4, low: 2, close: 3, volume: 10, timestamp: start.clone().add(5, "minutes")},
            {open: 1.5, high: 3, low: 1, close: 2, volume: 5, timestamp: start.clone().add(1, "minutes")},
        ]);
    });
});
