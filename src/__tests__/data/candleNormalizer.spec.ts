/* tslint:disable */
import "jest";
import CandleNormalizer, {CandleNormalizerConfig} from "../../sockTrader/data/candleNormalizer";
import {DataFrame, IDataFrame} from "data-forge";
import moment from "moment";

function createDataFrame() {
    // @formatter:off
    return new DataFrame([
        {high: 5663.99, low: 5639.25, open: 5658.11, close: 5647.88, volume: 0.67, timestamp: moment("2019-05-06T10:00:00.000Z")},
        {high: 5660, low: 5608.04, open: 5627.37, close: 5658.11, volume: 10.623, timestamp: moment("2019-05-06T02:00:00.000Z")},
        {high: 5638, low: 5613.12, open: 5621.01, close: 5627.3766, volume: 20, timestamp: moment("2019-05-06T01:00:00.000Z")},
    ]);
    // @formatter:on
}

function createNormalizer() {
    const file = "./coinbase_btcusd_1h.csv";
    const config = {symbol: ["BTC", "USD"], name: "Bitcoin"} as CandleNormalizerConfig;
    return new CandleNormalizer(file, config, (candles: IDataFrame) => candles);
}

let normalizer = createNormalizer();
beforeEach(() => {
    normalizer = createNormalizer();
});

jest.mock("data-forge-fs", () => {
    return {
        readFile: () => ({
            parseCSV: async () => createDataFrame(),
        }),
    };
});

describe("determineCandleInterval", () => {
    test("Should determine smallest interval in a series of timestamps", async () => {
        const result = normalizer["determineCandleInterval"](createDataFrame());
        expect(result).toEqual(60);
    });
});

describe("determinePriceDecimals", () => {
    test("Should determine price decimals in a series of candles", async () => {
        const result = normalizer["determinePriceDecimals"](createDataFrame());
        expect(result).toEqual(10000);
    });
});

describe("determineVolumeDecimals", () => {
    test("Should determine amount of volume decimals in a series of candles", async () => {
        const result = normalizer["determineVolumeDecimals"](createDataFrame());
        expect(result).toEqual(3);
    });
});

describe("validateColumns", () => {
    test("Should throw if dataFrame does not contain the required columns", async () => {
        const df = createDataFrame().renameSeries({timestamp: "ts"});
        expect(() => normalizer["validateColumns"](df)).toThrow("Columns of DataFrame are not valid!");
    });
});

describe("normalize", () => {
    test("Should run all individual normalize functions and return complete result", async () => {
        const result = await normalizer.normalize();
        expect(result).toEqual(expect.objectContaining({
            candleInterval: 60,
            candles: expect.any(Array),
            name: "Bitcoin",
            priceDecimals: 10000,
            symbol: ["BTC", "USD"],
            volumeDecimals: 3,
        }));
    });
});

describe("parseFileReader", () => {
    test("Should parse a JSON file", async () => {
        const mockFileReader = {parseJSON: jest.fn()};
        await CandleNormalizer.parseFileReader(mockFileReader as any, "json");

        expect(mockFileReader.parseJSON).toBeCalledTimes(1);
    });

    test("Should parse a CSV file", async () => {
        const mockFileReader = {parseCSV: jest.fn()};
        await CandleNormalizer.parseFileReader(mockFileReader as any, "csv");

        expect(mockFileReader.parseCSV).toBeCalledWith({dynamicTyping: true});
        expect(mockFileReader.parseCSV).toBeCalledTimes(1);
    });

    test("Should throw when invalid extension is given", () => {
        const invalidFileReader = CandleNormalizer.parseFileReader({} as any, "exe");
        expect(invalidFileReader).rejects.toThrow("File extension is not valid! Expecting a CSV or JSON file.");
    });
});
