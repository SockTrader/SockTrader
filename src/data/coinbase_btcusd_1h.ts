import {IDataFrame} from "data-forge";
import moment from "moment";
import path from "path";
import CandleNormalizer from "../sockTrader/data/candleNormalizer";
import {ICandle} from "../sockTrader/core/types/ICandle";

const SRC_PATH = "../../src/data";
const PATH = path.resolve(__dirname, SRC_PATH, "coinbase_btcusd_1h.csv");

// noinspection JSUnusedGlobalSymbols
export default new CandleNormalizer(PATH, {symbol: ["BTC", "USD"], name: "Bitcoin"},
    (dataFrame: IDataFrame<number>): IDataFrame<number, ICandle> => {
        return dataFrame
            .dropSeries(["Symbol", "Volume BTC"])
            .renameSeries({
                "Date": "timestamp",
                "High": "high",
                "Low": "low",
                "Open": "open",
                "Close": "close",
                "Volume USD": "volume",
            })
            .select(row => {
                row.timestamp = moment.utc(row.timestamp, "YYYY-MM-DD hh-A");
                return row;
            });
    },
);
