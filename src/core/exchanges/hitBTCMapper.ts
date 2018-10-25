import {EventEmitter} from "events";
import moment = require("moment");
import {ICandle, ICandleInterval} from "../candleCollection";
import logger from "../logger";
import {IOrderbookEntry} from "../orderbook";
import Exchange, {IResponseMapper} from "./exchange";
import {CandleInterval} from "./hitBTC";

export interface IHitBTCOrderbookResponse {
    jsonrpc: string;
    method: string;
    params: {
        ask: IOrderbookEntry[],
        bid: IOrderbookEntry[],
        sequence: number,
        symbol: string,
    };
}

interface IHitBTCCandlesResponse {
    jsonrpc: string;
    method: string;
    params: {
        data: Array<{
            close: string;
            max: string;
            min: string;
            open: string;
            timestamp: string;
            volume: string;
            volumeQuote: string;
        }>;
        period: string;
        symbol: string;
    };
}

interface IHitBTCAuthenticateResponse {
    id: string;
    jsonrpc: string;
    result: boolean;
}

interface IHitBTCGetSymbolsResponse {
    id: string;
    jsonrpc: string;
    result: Array<{
        baseCurrency: string;
        feeCurrency: string;
        id: string;
        provideLiquidityRate: string;
        quantityIncrement: string;
        quoteCurrency: string;
        takeLiquidityRate: string;
        tickSize: string;
    }>;
}

export default class HitBTCMapper extends EventEmitter implements IResponseMapper {

    constructor(private exchange: Exchange) {
        super();

        // Listen for all events that onReceive will be throwing..
        this.on("api.snapshotCandles", (data) => this.onUpdateCandles(data, "set"));
        this.on("api.updateCandles", (data) => this.onUpdateCandles(data, "update"));
        this.on("api.snapshotOrderbook", (data) => this.onUpdateOrderbook(data, "setOrders"));
        this.on("api.updateOrderbook", (data) => this.onUpdateOrderbook(data, "addIncrement"));
        this.on("api.report", (data) => this.onReport(data));
        this.on("api.login", (data) => this.onLogin(data));
        this.on("api.getSymbols", (data) => this.onGetSymbols(data)); // @TODO fix!
    }

    public destroy(): void {
        this.removeAllListeners();
    }

    // @TODO fix type any
    public onReceive(msg: any): void {
        if (msg.type !== "utf8") {
            throw new Error("Response is not UTF8!");
        }

        const d = JSON.parse(msg.utf8Data);
        this.emit(`api.${d.method || d.id}`, d);
    }

    private mapCandles(data: IHitBTCCandlesResponse): ICandle[] {
        return data.params.data.map<ICandle>((candle) => ({
            close: parseFloat(candle.close),
            high: parseFloat(candle.max),
            low: parseFloat(candle.min),
            open: parseFloat(candle.open),
            timestamp: moment(candle.timestamp).second(0).millisecond(0),
            volume: parseFloat(candle.volumeQuote),
        }));
    }

    private onGetSymbols(response: IHitBTCGetSymbolsResponse): void {
        const result = response.result.map(({id, tickSize, quantityIncrement}) => ({
            id,
            quantityIncrement: parseInt(quantityIncrement, 10),
            tickSize: parseFloat(tickSize),
        }));
        this.exchange.onCurrenciesLoaded(result);
    }

    private onLogin(data: IHitBTCAuthenticateResponse): void {
        this.exchange.isAuthenticated = data.result;
        this.exchange.isReady();
    }

    private onReport(data: JSON): void {
        // @TODO map response to internal data structure
        this.exchange.onReport(data);
    }

    private onUpdateCandles(data: IHitBTCCandlesResponse, method: "set"|"update") {
        let interval: ICandleInterval | null = null;
        Object.keys(CandleInterval).some((key) => {
            if (CandleInterval[key].code === data.params.period) {
                interval = CandleInterval[key];
                return true;
            }
            return false;
        });

        if (interval !== null) {
            return this.exchange.onUpdateCandles(data.params.symbol, this.mapCandles(data), interval, method);
        }

        logger.debug(`Interval: "${data.params.period}" is not recognized by the system. The e|xchange callback "onUpdateCandles" was not triggered.`);
    }

    private onUpdateOrderbook(data: IHitBTCOrderbookResponse, method: "addIncrement" | "setOrders"): void {
        // @TODO map response to internal data structure
        this.exchange.onUpdateOrderbook(data.params, method);
    }
}
