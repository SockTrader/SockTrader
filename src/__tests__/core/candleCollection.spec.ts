import moment from "moment";
import CandleCollection from "../../sockTrader/core/candles/candleCollection";

function createCandles() {
    return new CandleCollection(...[
        // @formatter:off
        {open: 5594.4, high: 5635, low: 5594.39, close: 5625.06, volume: 255.84, timestamp: moment("2019-05-06 09:00")},
        {open: 5581.59, high: 5615, low: 5564.93, close: 5594.4, volume: 225.33, timestamp: moment("2019-05-06 08:00")},
        {open: 5618.63, high: 5627.01, low: 5571.67, close: 5581.59, volume: 280.47, timestamp: moment("2019-05-06 07:00")},
        {open: 5647.88, high: 5651.7, low: 5588.71, close: 5618.63, volume: 250.94, timestamp: moment("2019-05-06 06:00")},
        {open: 5658.11, high: 5663.99, low: 5639.25, close: 5647.88, volume: 158.95, timestamp: moment("2019-05-06 05:00")},
        {open: 5627.37, high: 5660, low: 5608.04, close: 5658.11, volume: 263.87, timestamp: moment("2019-05-06 04:00")},
        {open: 5621.01, high: 5638, low: 5613.12, close: 5627.37, volume: 204.55, timestamp: moment("2019-05-06 03:00")},
        // @formatter:on
    ]);
}

let candles = createCandles();
beforeEach(() => {
    candles = createCandles();
});

describe("Candle collection", () => {
    test("Should return list of open values", () => {
        expect(candles.open).toEqual([5594.4, 5581.59, 5618.63, 5647.88, 5658.11, 5627.37, 5621.01]);
    });

    test("Should return list of high values", () => {
        expect(candles.high).toEqual([5635, 5615, 5627.01, 5651.7, 5663.99, 5660, 5638]);
    });

    test("Should return list of low values", () => {
        expect(candles.low).toEqual([5594.39, 5564.93, 5571.67, 5588.71, 5639.25, 5608.04, 5613.12]);
    });

    test("Should return list of close values", () => {
        expect(candles.close).toEqual([5625.06, 5594.4, 5581.59, 5618.63, 5647.88, 5658.11, 5627.37]);
    });

    test("Should return list of volume values", () => {
        expect(candles.volume).toEqual([255.84, 225.33, 280.47, 250.94, 158.95, 263.87, 204.55]);
    });

    test.skip("Should return list of timestamp values", () => {
        // @TODO validate array of Moment timestamps
        expect(candles.timestamp).toEqual([
            "2019-05-06T07:00:00.000Z",
            "2019-05-06T06:00:00.000Z",
            "2019-05-06T05:00:00.000Z",
            "2019-05-06T04:00:00.000Z",
            "2019-05-06T03:00:00.000Z",
            "2019-05-06T02:00:00.000Z",
            "2019-05-06T01:00:00.000Z",
        ]);
    });

    test("Should return first X amount of candles", () => {
        const result = candles.first(1);
        expect(result.length).toEqual(1);
    });

    test("Should return last X amount of candles", () => {
        const result = candles.last(1);
        expect(result.length).toEqual(1);
    });
});
