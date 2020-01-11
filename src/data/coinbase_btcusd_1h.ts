import {IDataFrame} from "data-forge";
import moment from "moment";
import {Candle} from "../sockTrader/core/types/candle";
import CandleNormalizer from "../sockTrader/data/candleNormalizer";

const normalize = (dataFrame: IDataFrame): IDataFrame<number, Candle> => dataFrame
    .dropSeries(["Symbol", "Volume BTC"])
    .renameSeries({
        "Date": "timestamp",
        "High": "high",
        "Low": "low",
        "Open": "open",
        "Close": "close",
        "Volume USD": "volume",
    })
    .select(row => ({
        ...row,
        timestamp: moment.utc(row.timestamp, "YYYY-MM-DD hh-A"),
    }));

// noinspection JSUnusedGlobalSymbols
export default new CandleNormalizer("coinbase_btcusd_1h.csv", {symbol: ["BTC", "USD"], name: "Bitcoin"}, normalize);
