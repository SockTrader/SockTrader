import {IDataFrame} from "data-forge";
import {IAsyncFileReader, readFile} from "data-forge-fs";
import {max, Moment} from "moment";
import {Error} from "tslint/lib/error";
import {IAssetMap} from "../assets/wallet";
import {decimals} from "../strategy/utils";
import {Pair} from "../types/pair";
import moment = require("moment");

export interface ICandleLoaderConfig {
    decimalSeperator: string;
    name: string;
    symbol: Pair;
}

export type Parser = (candles: IDataFrame<number, any>) => IDataFrame<number, any>;

/**
 * The CandleLoader parses a file containing candles and returns
 * in data for in memory processing
 */
export default class CandleLoader {

    constructor(private filePath: string, public candleLoaderConfig: ICandleLoaderConfig, private parser?: Parser) {
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
     * Actual parsing of file returning data
     * @returns {Promise<IDataFrame<number, any>>}
     */
    async parse(): Promise<any> {
        const segs = this.filePath.split(".");
        const ext = segs[segs.length - 1].toLowerCase();

        const dataFrame: IDataFrame<number, any> = await CandleLoader.parseFileReader(readFile(this.filePath), ext);

        if (this.parser) {
            const parsedDataFrame = this.parser(dataFrame);

            const volumeSeries = parsedDataFrame.deflate(candle => decimals(candle.volume, this.candleLoaderConfig.decimalSeperator));
            if (volumeSeries.count() <= 0) {
                console.log("No volume series found, use renameSeries to flag a column as a volume column");
            }
            const volumeDecimals = volumeSeries.max();

            const priceSeries = parsedDataFrame
                .deflate(candle =>
                    Math.max(decimals(candle.open, this.candleLoaderConfig.decimalSeperator),
                        decimals(candle.close, this.candleLoaderConfig.decimalSeperator),
                        decimals(candle.high, this.candleLoaderConfig.decimalSeperator),
                        decimals(candle.low, this.candleLoaderConfig.decimalSeperator)));
            if (priceSeries.count() <= 0) {
                console.log("No price series found, use renameSeries to flag a column as a price column (open, close, high, low)");
            }

            const timestampSeries = parsedDataFrame
                .deflate(candle => candle.timestamp);

            const pricesDecimals = priceSeries.max();
            const candles = parsedDataFrame.toArray();
            const config = {
                volumeDecimals,
                priceDecimals: Math.pow(10, pricesDecimals),
                symbol: this.candleLoaderConfig.symbol,
                name: this.candleLoaderConfig.name,
            };

            return {config, candles};
        }
        return dataFrame.toArray();
    }
}
