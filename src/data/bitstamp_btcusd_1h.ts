import {IDataFrame} from "data-forge";
import moment from "moment";
import path from "path";
import CandleLoader from "../sockTrader/core/candles/candleLoader";

const SRC_PATH = "../../src/data";
const PATH = path.resolve(__dirname, SRC_PATH, "bitstamp_btcusd_1h.csv");

const parser = (dataFrame: IDataFrame<number, any>): IDataFrame<number, any> => {
    return dataFrame
        .dropSeries(["Symbol"])
        .renameSeries({
            "Date": "timestamp",
            "High": "high",
            "Low": "low",
            "Open": "open",
            "Close": "close",
            "Volume To": "volume",
        })
        .select(row => {
            row.timestamp = moment(row.timestamp, "YYYY-MM-DD hh-A");
            return row;
        });
};

export default new CandleLoader(PATH, parser);
