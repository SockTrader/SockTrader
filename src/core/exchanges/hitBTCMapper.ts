import {EventEmitter} from "events";
import moment from "moment";
import {IMessage} from "websocket";
import {Pair} from "../../types/pair";
import {ICandle, ICandleInterval} from "../candleCollection";
import logger from "../logger";
import {IOrderbookEntry} from "../orderbook";
import {OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../orderInterface";
import BaseExchange, {IResponseMapper} from "./baseExchange";
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

interface IHitBTCReportResponse {
    jsonrpc: string;
    method: string;
    params: Array<{
        clientOrderId: string;
        createdAt: string;
        cumQuantity: string;
        id: string;
        originalRequestClientOrderId?: string;
        postOnly: boolean;
        price: string;
        quantity: string;
        reportType: string;
        side: string;
        status: string;
        symbol: string;
        timeInForce: string;
        type: string;
        updatedAt: string;
    }>;
}

export default class HitBTCMapper extends EventEmitter implements IResponseMapper {

    constructor(private exchange: BaseExchange) {
        super();

        // Listen for all events that onReceive will be throwing..
        this.on("api.snapshotCandles", data => this.onUpdateCandles(data, "set"));
        this.on("api.updateCandles", data => this.onUpdateCandles(data, "update"));
        this.on("api.snapshotOrderbook", data => this.onUpdateOrderbook(data, "setOrders"));
        this.on("api.updateOrderbook", data => this.onUpdateOrderbook(data, "addIncrement"));
        this.on("api.report", data => this.onReport(data));
        this.on("api.login", data => this.onLogin(data));
        this.on("api.getSymbols", data => this.onGetSymbols(data)); // @TODO fix!
    }

    destroy(): void {
        this.removeAllListeners();
    }

    onReceive(msg: IMessage): void {
        if (msg.type !== "utf8") {
            throw new Error("Response is not UTF8!");
        }

        if (msg.utf8Data) {
            const d = JSON.parse(msg.utf8Data);
            this.emit(`api.${d.method || d.id}`, d);
        }
    }

    private mapCandles(data: IHitBTCCandlesResponse): ICandle[] {
        return data.params.data.map<ICandle>(candle => ({
            close: parseFloat(candle.close),
            high: parseFloat(candle.max),
            low: parseFloat(candle.min),
            open: parseFloat(candle.open),
            timestamp: moment(candle.timestamp).second(0).millisecond(0),
            volume: parseFloat(candle.volumeQuote),
        }));
    }

    private onGetSymbols(response: IHitBTCGetSymbolsResponse): void {
        const result = response.result.map(({id, tickSize, quantityIncrement, baseCurrency, quoteCurrency}) => ({
            id: [baseCurrency, quoteCurrency] as Pair,
            quantityIncrement: parseFloat(quantityIncrement),
            tickSize: parseFloat(tickSize),
        }));
        this.exchange.onCurrenciesLoaded(result);
    }

    private onLogin(data: IHitBTCAuthenticateResponse): void {
        this.exchange.isAuthenticated = data.result;
        this.exchange.isReady();
    }

    private onReport(data: IHitBTCReportResponse): void {
        data.params.forEach(report => {
            this.exchange.onReport({
                id: report.clientOrderId,
                originalId: (report.originalRequestClientOrderId) ? report.originalRequestClientOrderId : undefined,
                createdAt: moment(report.createdAt),
                price: parseFloat(report.price),
                quantity: parseFloat(report.quantity),
                reportType: report.reportType as ReportType,
                side: report.side as OrderSide,
                status: report.status as OrderStatus,
                pair: this.exchange.currencies[report.symbol].id,
                timeInForce: report.timeInForce as OrderTimeInForce,
                type: report.type as OrderType,
                updatedAt: moment(report.updatedAt),
            });
        });
    }

    private onUpdateCandles(data: IHitBTCCandlesResponse, method: "set" | "update") {
        let interval: ICandleInterval | undefined;
        Object.keys(CandleInterval).some(key => {
            if (CandleInterval[key].code === data.params.period) {
                interval = CandleInterval[key];
                return true;
            }
            return false;
        });

        if (interval !== undefined) {
            const pair = this.exchange.currencies[data.params.symbol].id;
            return this.exchange.onUpdateCandles(pair, this.mapCandles(data), interval, method);
        }

        logger.debug(`Interval: "${data.params.period}" is not recognized by the system. The exchange callback "onUpdateCandles" was not triggered.`);
    }

    private onUpdateOrderbook({params: ob}: IHitBTCOrderbookResponse, method: "addIncrement" | "setOrders"): void {
        this.exchange.onUpdateOrderbook({
            ask: ob.ask,
            bid: ob.bid,
            pair: this.exchange.currencies[ob.symbol].id,
            sequence: ob.sequence,
        }, method);
    }
}
