import {IDataFrame} from "data-forge";
import {IAsyncFileReader, readFile} from "data-forge-fs";

export type Parser = (candles: IDataFrame<number, any>) => IDataFrame<number, any>;

/**
 * The CandleLoader parses a file containing candles and returns
 * in data for in memory processing
 */
export default class CandleLoader {

    constructor(private filePath: string, private parser?: Parser) {
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
    async parse(): Promise<IDataFrame<number, any>> {
        const segs = this.filePath.split(".");
        const ext = segs[segs.length - 1].toLowerCase();

        const dataFrame = await CandleLoader.parseFileReader(readFile(this.filePath), ext);
        return (this.parser) ? this.parser(dataFrame) : dataFrame;
    }
}
