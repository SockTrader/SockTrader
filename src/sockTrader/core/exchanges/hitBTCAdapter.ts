import {EventEmitter} from "events";
import moment from "moment";
import {Data} from "../connection/webSocket";
import logger from "../logger";
import {IHitBTCAuthenticateResponse} from "../types/exchanges/IHitBTCAuthenticateResponse";
import {IHitBTCCandlesResponse} from "../types/exchanges/IHitBTCCandlesResponse";
import {IHitBTCGetSymbolsResponse} from "../types/exchanges/IHitBTCGetSymbolsResponse";
import {IHitBTCOrderbookResponse} from "../types/exchanges/IHitBTCOrderbookResponse";
import {IHitBTCReportResponse} from "../types/exchanges/IHitBTCReportResponse";
import {ICandle} from "../types/ICandle";
import {ICandleInterval} from "../types/ICandleInterval";
import {IOrderbookData} from "../types/IOrderbookData";
import {IResponseAdapter} from "../types/IResponseAdapter";
import {ITradeablePair} from "../types/ITradeablePair";
import {OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../types/order";
import HitBTC, {CandleInterval} from "./hitBTC";

/**
 * The HitBTCAdapter maps incoming api events and wraps them with additional checks/logic
 */
export default class HitBTCAdapter extends EventEmitter implements IResponseAdapter {

    private readonly exchange: HitBTC;

    /**
     * Create a new HitBTCAdapter
     * @param {BaseExchange} exchange the exchange to map events from
     */
    constructor(exchange: HitBTC) {
        super();
        this.exchange = exchange;

        // Listen for all events that onReceive will be throwing..
        this.once("api.snapshotCandles", data => this.onSnapshotCandles(data));
        this.on("api.updateCandles", data => this.onUpdateCandles(data));
        this.on("api.snapshotOrderbook", data => this.onSnapshotOrderbook(data));
        this.on("api.updateOrderbook", data => this.onUpdateOrderbook(data));
        this.on("api.report", data => this.onReport(data));
        this.on("api.login", data => this.onLogin(data));
        this.on("api.getSymbols", data => this.onGetSymbols(data)); // @TODO fix!
    }

    /**
     * Removes HitBTCAdapter listeners
     */
    destroy(): void {
        this.removeAllListeners();
    }

    /**
     * Emits received message as api event
     * @param {IMessage} msg
     */
    onReceive(msg: Data): void {
        if (typeof msg === "string") {
            const data = JSON.parse(msg);
            this.emit(`api.${data.method || data.id}`, data);
        }
    }

    /**
     * Maps HitBTC data to candle collection
     * @param {IHitBTCCandlesResponse} data the date from hitBTC
     * @returns {ICandle[]} the candle collection
     */
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

    /**
     * Wraps the returning symbols (allowed pairs)
     * @param {IHitBTCGetSymbolsResponse} response
     */
    private onGetSymbols(response: IHitBTCGetSymbolsResponse): void {
        const result = response.result.map<ITradeablePair>(({tickSize, quantityIncrement, baseCurrency, quoteCurrency}) => ({
            id: [baseCurrency, quoteCurrency],
            quantityIncrement: parseFloat(quantityIncrement),
            tickSize: parseFloat(tickSize),
        }));
        this.exchange.onCurrenciesLoaded(result);
    }

    /**
     * Wraps login callback
     * @param {IHitBTCAuthenticateResponse} data
     */
    private onLogin(data: IHitBTCAuthenticateResponse): void {
        this.exchange.isAuthenticated = data.result;
        this.exchange.isReady();
    }

    /**
     * Wraps incoming report (order updates)
     * @param {IHitBTCReportResponse} data report data
     */
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
                pair: this.exchange.currencies[report.symbol].id, // @TODO Currency pair could be undefined in HitBTCAdapter
                timeInForce: report.timeInForce as OrderTimeInForce,
                type: report.type as OrderType,
                updatedAt: moment(report.updatedAt),
            });
        });
    }

    /**
     * Tries to find a valid ICandleInterval in the response. Undefined will be returned if nothing was found
     * @param response
     */
    private getIntervalFromResponse(response: IHitBTCCandlesResponse): ICandleInterval | undefined {
        let interval: ICandleInterval | undefined;

        for (const key in CandleInterval) {
            if (!CandleInterval.hasOwnProperty(key)) continue;
            if (CandleInterval[key].code === response.params.period) {
                interval = CandleInterval[key];
                break;
            }
        }

        if (interval === undefined) logger.debug(`Interval: "${response.params.period}" is not recognized by the system.`);
        return interval;
    }

    private getPairFromResponse({params: {symbol}}: IHitBTCCandlesResponse) {
        return this.exchange.currencies[symbol].id;
    }

    /**
     * Converts candles coming from the HitBTC exchange into a generic data structure
     * @param {IHitBTCCandlesResponse} response the candles
     */
    private onSnapshotCandles(response: IHitBTCCandlesResponse) {
        const interval = this.getIntervalFromResponse(response);
        if (interval) this.exchange.onSnapshotCandles(this.getPairFromResponse(response), this.mapCandles(response), interval);
    }

    /**
     * Converts candles coming from the HitBTC exchange into a generic data structure
     * @param {IHitBTCCandlesResponse} response the candles
     */
    private onUpdateCandles(response: IHitBTCCandlesResponse) {
        const interval = this.getIntervalFromResponse(response);
        if (interval) this.exchange.onUpdateCandles(this.getPairFromResponse(response), this.mapCandles(response), interval);
    }

    /**
     * Converts the response into IOrderbookData
     * @param ob
     */
    private mapOrderbook({params: ob}: IHitBTCOrderbookResponse): IOrderbookData {
        return {
            ask: ob.ask,
            bid: ob.bid,
            pair: this.exchange.currencies[ob.symbol].id,
            sequence: ob.sequence,
        };
    }

    /**
     * Converts the response and forward the result to the HitBTC exchange instance
     * @param response the orderbook
     */
    private onSnapshotOrderbook(response: IHitBTCOrderbookResponse): void {
        this.exchange.onSnapshotOrderbook(this.mapOrderbook(response));
    }

    /**
     * Converts the response and forward the result to the HitBTC exchange instance
     * @param response the orderbook
     */
    private onUpdateOrderbook(response: IHitBTCOrderbookResponse): void {
        this.exchange.onUpdateOrderbook(this.mapOrderbook(response));
    }
}
