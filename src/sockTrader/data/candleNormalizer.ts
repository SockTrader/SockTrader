import {IDataFrame} from "data-forge";
import {IAsyncFileReader, readFile} from "data-forge-fs";
import moment from "moment";
import {ICandle} from "../core/types/ICandle";
import {Pair} from "../core/types/pair";
import {getDecimals} from "./utils";

export interface ICandleNormalizerConfig {
    decimalSeparator?: string;
    name: string;
    symbol: Pair;
}

export type Parser = (candles: IDataFrame) => IDataFrame<number, ICandle>;

/**
 * The CandleNormalizer parses a file containing candles and returns
 * in data for in memory processing
 */
export default class CandleNormalizer {

    private readonly filePath: string;
    private readonly parser: Parser;

    constructor(filePath: string, public candleNormalizerConfig: ICandleNormalizerConfig, parser: Parser) {
        this.parser = parser;
        this.filePath = filePath;
    }

    /**
     * Parses file depending on the extension/type
     * @param {IAsyncFileReader} fileReader the file to read
     * @param {string} extension the extension
     * @returns {Promise<IDataFrame>} promise
     */
    static async parseFileReader(fileReader: IAsyncFileReader, extension: string): Promise<IDataFrame> {
        if (extension === "json") {
            return fileReader.parseJSON();
        }

        if (extension === "csv") {
            return fileReader.parseCSV({dynamicTyping: true});
        }

        throw new Error("File extension is not valid! Expecting a CSV or JSON file.");
    }

    /**
     * Determine smallest candle interval of all candles
     * @param df
     */
    determineCandleInterval(df: IDataFrame): number {
        const [interval] = df.aggregate([] as any, (prev, value) => {
            const [prevInterval, date] = prev;

            let i;
            if (date !== undefined) {
                const minutes = Math.abs(moment.duration(date.diff(value.timestamp)).asMinutes());
                i = (!prevInterval || minutes < prevInterval) ? minutes : prevInterval;
            }

            return [i, value.timestamp];
        });

        return interval;
    }

    determinePriceDecimals(df: IDataFrame): number {
        const {decimalSeparator: ds} = this.candleNormalizerConfig;
        const agg = df.aggregate(0, (accum, candle) => Math.max(
            accum,
            getDecimals(candle.open, ds),
            getDecimals(candle.high, ds),
            getDecimals(candle.low, ds),
            getDecimals(candle.close, ds),
        ));

        return Math.pow(10, agg);
    }

    determineVolumeDecimals(df: IDataFrame): number {
        const {decimalSeparator: ds} = this.candleNormalizerConfig;
        return df.aggregate(0, ((accum, candle) => Math.max(accum, getDecimals(candle.volume, ds))));
    }

    validateColumns(df: IDataFrame) {
        const columnNames = df.getColumnNames();
        const requiredColumns = ["timestamp", "open", "high", "low", "close", "volume"];

        if (columnNames.some(r => requiredColumns.indexOf(r) < 0)) {
            throw new Error(
                "Columns of DataFrame are not valid! " +
                "Expecting: 'open', 'high', 'low', 'close', 'timestamp', 'volume' as valid columns",
            );
        }
    }

    /**
     * Actual parsing of file returning data
     * @returns {Promise<IDataFrame<number>>}
     */
    async normalize(): Promise<any> {
        const segs = this.filePath.split(".");
        const ext = segs[segs.length - 1].toLowerCase();

        const dataFrame: IDataFrame<number, ICandle> = this.parser(await CandleNormalizer.parseFileReader(readFile(this.filePath), ext));

        this.validateColumns(dataFrame);

        return {
            candles: dataFrame.orderByDescending(row => row.timestamp).toArray(),
            name: this.candleNormalizerConfig.name,
            symbol: this.candleNormalizerConfig.symbol,
            volumeDecimals: this.determineVolumeDecimals(dataFrame),
            priceDecimals: this.determinePriceDecimals(dataFrame),
            candleInterval: this.determineCandleInterval(dataFrame),
        };
    }
}
