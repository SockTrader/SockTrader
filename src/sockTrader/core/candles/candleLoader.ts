import {IDataFrame} from "data-forge";
import {IAsyncFileReader, readFile} from "data-forge-fs";
import moment from "moment";
import {Error} from "tslint/lib/error";
import {getDecimals} from "../../data/utils";
import {Pair} from "../types/pair";
import {ICandle} from "./candleCollection";

export interface ICandleLoaderConfig {
    decimalSeparator?: string;
    name: string;
    symbol: Pair;
}

export type Parser = (candles: IDataFrame<number, any>) => IDataFrame<number, ICandle>;

/**
 * The CandleLoader parses a file containing candles and returns
 * in data for in memory processing
 */
export default class CandleLoader {

    constructor(private filePath: string, public candleLoaderConfig: ICandleLoaderConfig, private parser: Parser) {
    }

    /**
     * Parses file depending on the extension/type
     * @param {IAsyncFileReader} fileReader the file to read
     * @param {string} extension the extension
     * @returns {Promise<IDataFrame<number, any>>} promise
     */
    static async parseFileReader(fileReader: IAsyncFileReader, extension: string): Promise<IDataFrame<number, any>> {
        if (extension === "json") {
            return await fileReader.parseJSON();
        }

        if (extension === "csv") {
            return await fileReader.parseCSV({dynamicTyping: true});
        }

        throw new Error("File extension is not valid! Expecting a CSV or JSON file.");
    }

    /**
     * Determine smallest candle interval of all candles
     * @param df
     */
    determineCandleInterval(df: IDataFrame<number, any>): number {
        const [interval] = df.aggregate([] as any, (prev, value) => {
            const [prevInterval, date] = prev;

            let i;
            if (date !== undefined) {
                const minutes = moment.duration(date.diff(value.timestamp)).asMinutes();
                if (!prevInterval || minutes < prevInterval) i = minutes;
            }

            return [i, value.timestamp];
        });

        return interval;
    }

    determinePriceDecimals(df: IDataFrame<number, any>): number {
        const {decimalSeparator: ds} = this.candleLoaderConfig;
        const agg = df.aggregate(0, (accum, candle) => Math.max(
            accum,
            getDecimals(candle.open, ds),
            getDecimals(candle.high, ds),
            getDecimals(candle.low, ds),
            getDecimals(candle.close, ds),
        ));

        return Math.pow(10, agg);
    }

    determineVolumeDecimals(df: IDataFrame<number, any>): number {
        const {decimalSeparator: ds} = this.candleLoaderConfig;
        return df.aggregate(0, ((accum, candle) => Math.max(0, getDecimals(candle.volume, ds))));
    }

    /**
     * Actual parsing of file returning data
     * @returns {Promise<IDataFrame<number, any>>}
     */
    async parse(): Promise<any> {
        const segs = this.filePath.split(".");
        const ext = segs[segs.length - 1].toLowerCase();

        const dataFrame: IDataFrame<number, any> = this.parser(await CandleLoader.parseFileReader(readFile(this.filePath), ext));

        const volumeDecimals = this.determineVolumeDecimals(dataFrame);
        const priceDecimals = this.determinePriceDecimals(dataFrame);
        const candleInterval = this.determineCandleInterval(dataFrame);

        console.log(volumeDecimals, priceDecimals, candleInterval);

        // @TODO add symbol
        // symbol: this.candleLoaderConfig.symbol,

        // @TODO add name
        // name: this.candleLoaderConfig.name,

        // @TODO return configuration
        return dataFrame.toArray();
    }
}
