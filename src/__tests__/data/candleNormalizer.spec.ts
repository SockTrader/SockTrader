/* tslint:disable */
import "jest";
import CandleNormalizer from "../../sockTrader/data/candleNormalizer";
import {DataFrame} from "data-forge";
import {IAsyncFileReader} from "data-forge-fs";
import moment from "moment";

function createNormalizer() {
    return new CandleNormalizer("./coinbase_btcusd_1h.csv", {symbol: ["BTC", "USD"], name: "Bitcoin"}, () => {
        return new DataFrame();
    });
}

let normalizer = createNormalizer();
beforeEach(() => {
    normalizer = createNormalizer();
});

describe("Candle normalizer", () => {
    test("Should determine smallest interval in a series of timestamps", async () => {
        const result = normalizer.determineCandleInterval(
            new DataFrame([
                {timestamp: moment("2019-05-06T10:00:00.000Z")},
                {timestamp: moment("2019-05-06T02:00:00.000Z")},
                {timestamp: moment("2019-05-06T01:00:00.000Z")},
            ]),
        );

        expect(result).toEqual(60);
    });

    test("Should determine price decimals in a series of candles", async () => {
        const result = normalizer.determinePriceDecimals(
            new DataFrame([
                {
                    "high": 5663.99,
                    "low": 5639.25,
                    "open": 5658.11,
                    "close": 5647.88,
                },
                {
                    "high": 5660,
                    "low": 5608.04,
                    "open": 5627.37,
                    "close": 5658.11,
                },
                {
                    "high": 5638,
                    "low": 5613.12,
                    "open": 5621.01,
                    "close": 5627.3766, // <= number with highest precision
                },
            ]),
        );

        expect(result).toEqual(10000);
    });

    test("Should determine amount of volume decimals in a series of candles", async () => {
        expect(normalizer.determineVolumeDecimals(new DataFrame([
            {volume: 1.60},
            {volume: 2.62},
            {volume: 3.12},
        ]))).toEqual(2);

        expect(normalizer.determineVolumeDecimals(new DataFrame([
            {volume: 0.67},
            {volume: 10.623},
            {volume: 20},
        ]))).toEqual(3);
    });

    test("Should parse a file reader according to the given extension", async () => {
        const mockFileReader = {
            parseJSON: jest.fn(() => new Promise((resolve) => resolve(new DataFrame([1, 2, 3])))),
            parseCSV: jest.fn(() => new Promise((resolve) => resolve(new DataFrame([4, 5, 6])))),
        } as IAsyncFileReader;

        CandleNormalizer.parseFileReader(mockFileReader, "json");
        expect(mockFileReader.parseJSON).toBeCalledTimes(1);

        CandleNormalizer.parseFileReader(mockFileReader, "csv");
        expect(mockFileReader.parseCSV).toHaveBeenLastCalledWith({dynamicTyping: true});
        expect(mockFileReader.parseCSV).toBeCalledTimes(1);

        expect(CandleNormalizer.parseFileReader(mockFileReader, "exe")).rejects.toThrow("File extension is not valid! Expecting a CSV or JSON file.");
    });
});
