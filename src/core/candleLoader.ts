import {IDataFrame} from "data-forge";
import {IAsyncFileReader, readFile} from "data-forge-fs";

export type Parser = (candles: IDataFrame<number, any>) => IDataFrame<number, any>;

export default class CandleLoader {

    constructor(private filePath: string, private parser?: Parser) {
    }

    static async parseFileReader(fileReader: IAsyncFileReader, extension: string): Promise<IDataFrame<number, any>> {
        if (extension === "json") {
            return fileReader.parseJSON();
        }

        if (extension === "csv") {
            return fileReader.parseCSV({dynamicTyping: true});
        }

        throw new Error("File extension is not valid! Expecting a CSV or JSON file.");
    }

    async parse(): Promise<IDataFrame<number, any>> {
        const segs = this.filePath.split(".");
        const ext = segs[segs.length - 1].toLowerCase();

        const dataFrame = await CandleLoader.parseFileReader(readFile(this.filePath), ext);
        return (this.parser) ? this.parser(dataFrame) : dataFrame;
    }
}
