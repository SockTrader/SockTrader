import fs from "fs";
import {extname, resolve} from "path";
import express, {RequestHandler} from "express";
import {HistoryParams} from "../types/UDFHistory";
import moment from "moment";

const router = express.Router();

const BASE_PATH = "../../../data";
const ext = ".json";
const files: string[] = [];

fs.readdir(resolve(__dirname, BASE_PATH), (err, fileNames) => {
    fileNames.forEach(file => {
        if (extname(file) === ext) {
            files.push(file.replace(ext, ""));
        }
    });
});

const configHandler: RequestHandler = async (req, res) => {
    res.send({
        supported_resolutions: ["60", "120", "180", "240", "1D", "1W", "1M"],
        supports_group_request: false,
        supports_search: true,
        supports_marks: false,
        supports_timescale_marks: false,
    });
};

const resolveSymbol = async (symbol: string): Promise<[string, any]> => {
    try {
        return [symbol, await import(resolve(__dirname, BASE_PATH, `${symbol}.json`))];
    } catch (e) {
        if (!files[0]) return [symbol, undefined];

        return [files[0], await import(resolve(__dirname, BASE_PATH, `${files[0]}.json`))];
    }
};

const symbolsHandler: RequestHandler = async (req, res) => {
    try {
        const [fileName, data] = await resolveSymbol(req.query.symbol as string);
        if (!data) return res.send({});

        return res.send({
            name: data.name,
            ticker: fileName,
            full_name: fileName,
            description: "",
            exchange: "SockTrader",
            listed_exchange: "SockTrader",
            timezone: "Etc/UTC",
            has_seconds: false,
            has_daily: false,
            format: "price",
            has_weekly_and_monthly: false,
            has_empty_bars: true,
            type: "bitcoin",
            session: "24x7", // Cryptocurrency = 24x7 market
            has_intraday: true, // Cryptocurrency = 24x7 market
            minmov: 0.01, // Amount of price precision steps for 1 tick
            fractional: false, // Useful for altcoins!

            // Price precision
            // ex: 10^number-of-decimal-places
            pricescale: data.priceDecimals ? data.priceDecimals : 100,

            // Volume precision in number of decimal places
            volume_precision: data.volumeDecimals ? data.volumeDecimals : 2,

            // Which resolutions are available on the server side data.
            // Unavailable resolutions will be constructed based on these values
            intraday_multipliers: [data.candleInterval ? data.candleInterval.toString() : "60"],

            // Which resolutions should be visible on the chart
            supported_resolutions: [/*"1", "5", "15", */"60", "120", "180", "240", "1D", "1W", "1M"],
        });

    } catch (e) {
        return res.send({});
    }
};

const searchHandler: RequestHandler = async (req, res) => {
    const matches = files.filter(file => {
        return file.toLowerCase().indexOf((req.query.query as string).toLowerCase()) > -1;
    });

    res.send(matches.map(match => ({
        symbol: match,
        full_name: match,
        description: match,
        exchange: "SockTrader",
        ticker: match,
        type: "bitcoin",
    })));
};

const getRangeCandles = (bars: any[], start: number, end: number) => {
    const result = {
        t: [] as number[],
        c: [] as number[],
        o: [] as number[],
        h: [] as number[],
        l: [] as number[],
        v: [] as number[],
    };

    for (let i = bars.length; i > 0; i--) {
        const bar = bars[i - 1];
        if (bar === undefined) console.log(i - 1);
        const time = moment(bar.timestamp).unix();

        if (time >= start && time <= end) {
            result.t.unshift(time);
            result.c.unshift(bar.close);
            result.o.unshift(bar.open);
            result.h.unshift(bar.high);
            result.l.unshift(bar.low);
            result.v.unshift(bar.volume);
        } else if (time < end) {
            break;
        }
    }

    return result;
};

const historyHandler: RequestHandler<HistoryParams> = async ({query}, res, next) => {
    const start = parseInt(query.from as string);
    const end = parseInt(query.to as string);

    const {candles} = await import(resolve(__dirname, BASE_PATH, `${query.symbol}.json`));
    const oldest = moment(candles[0].timestamp).unix();
    const newest = moment(candles[candles.length - 1].timestamp).unix();

    if (end < oldest) return res.send({s: "no_data"});
    if (start > newest) return res.send({s: "no_data", nextTime: newest});

    const {t, c, o, h, l, v} = getRangeCandles(candles, start, end);
    return res.send({s: "ok", t, c, o, h, l, v});
};

const timeHandler: RequestHandler = async (req, res) => {
    res.send(moment().unix());
};

router.get("/config", configHandler);
router.get("/symbols", symbolsHandler);
router.get("/search", searchHandler);
router.get("/history", historyHandler);
router.get("/time", timeHandler);

export default router;
