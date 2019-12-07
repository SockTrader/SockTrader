import {EventEmitter} from "events";
import moment from "moment";
import {Data} from "../connection/webSocket";
import logger from "../logger";
import OrderTrackerFactory from "../order/orderTrackerFactory";
import {Candle} from "../types/candle";
import {CandleInterval} from "../types/candleInterval";
import {HitBTCAuthenticateResponse} from "../types/exchanges/hitBTCAuthenticateResponse";
import {HitBTCCandlesResponse} from "../types/exchanges/hitBTCCandlesResponse";
import {HitBTCGetSymbolsResponse} from "../types/exchanges/hitBTCGetSymbolsResponse";
import {HitBTCOrderbookResponse} from "../types/exchanges/hitBTCOrderbookResponse";
import {HitBTCReportResponse} from "../types/exchanges/hitBTCReportResponse";
import {OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../types/order";
import {OrderbookData} from "../types/orderbookData";
import {ResponseAdapter} from "../types/responseAdapter";
import {TradeablePair} from "../types/tradeablePair";
import HitBTC, {HitBTCCandleInterval} from "./hitBTC";

/**
 * The HitBTCAdapter maps incoming api events and wraps them with additional checks/logic
 */
export default class HitBTCAdapter extends EventEmitter implements ResponseAdapter {

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
     * @param {HitBTCCandlesResponse} data the date from hitBTC
     * @returns {Candle[]} the candle collection
     */
    private mapCandles(data: HitBTCCandlesResponse): Candle[] {
        return data.params.data.map<Candle>(candle => ({
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
     * @param {HitBTCGetSymbolsResponse} response
     */
    private onGetSymbols(response: HitBTCGetSymbolsResponse): void {
        const result = response.result.map<TradeablePair>(({tickSize, quantityIncrement, baseCurrency, quoteCurrency}) => ({
            id: [baseCurrency, quoteCurrency],
            quantityIncrement: parseFloat(quantityIncrement),
            tickSize: parseFloat(tickSize),
        }));
        this.exchange.onCurrenciesLoaded(result);
    }

    /**
     * Wraps login callback
     * @param {HitBTCAuthenticateResponse} data
     */
    private onLogin(data: HitBTCAuthenticateResponse): void {
        this.exchange.isAuthenticated = data.result;
        this.exchange.isReady();
    }

    /**
     * Wraps incoming report (order updates)
     * @param {HitBTCReportResponse} data report data
     */
    private onReport(data: HitBTCReportResponse): void {
        const orderTracker = OrderTrackerFactory.getInstance();
        data.params.forEach(report => {
            orderTracker.process({
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
     * Tries to find a valid CandleInterval in the response. Undefined will be returned if nothing was found
     * @param response
     */
    private getIntervalFromResponse(response: HitBTCCandlesResponse): CandleInterval | undefined {
        let interval: CandleInterval | undefined;

        for (const key in HitBTCCandleInterval) {
            if (!HitBTCCandleInterval.hasOwnProperty(key)) continue;
            if (HitBTCCandleInterval[key].code === response.params.period) {
                interval = HitBTCCandleInterval[key];
                break;
            }
        }

        if (interval === undefined) logger.warn(`Interval: "${response.params.period}" is not recognized by the system.`);
        return interval;
    }

    private getPairFromResponse({params: {symbol}}: HitBTCCandlesResponse) {
        return this.exchange.currencies[symbol].id;
    }

    /**
     * Converts candles coming from the HitBTC exchange into a generic data structure
     * @param {HitBTCCandlesResponse} response the candles
     */
    private onSnapshotCandles(response: HitBTCCandlesResponse) {
        const interval = this.getIntervalFromResponse(response);
        if (interval) this.exchange.onSnapshotCandles(this.getPairFromResponse(response), this.mapCandles(response), interval);
    }

    /**
     * Converts candles coming from the HitBTC exchange into a generic data structure
     * @param {HitBTCCandlesResponse} response the candles
     */
    private onUpdateCandles(response: HitBTCCandlesResponse) {
        const interval = this.getIntervalFromResponse(response);
        if (interval) this.exchange.onUpdateCandles(this.getPairFromResponse(response), this.mapCandles(response), interval);
    }

    /**
     * Converts the response into OrderbookData
     * @param ob
     */
    private mapOrderbook({params: ob}: HitBTCOrderbookResponse): OrderbookData {
        return {
            ask: ob.ask.map(a => ({price: parseFloat(a.price), size: parseFloat(a.size)})),
            bid: ob.bid.map(a => ({price: parseFloat(a.price), size: parseFloat(a.size)})),
            pair: this.exchange.currencies[ob.symbol].id,
            sequence: ob.sequence,
        };
    }

    /**
     * Converts the response and forward the result to the HitBTC exchange instance
     * @param response the orderbook
     */
    private onSnapshotOrderbook(response: HitBTCOrderbookResponse): void {
        this.exchange.onSnapshotOrderbook(this.mapOrderbook(response));
    }

    /**
     * Converts the response and forward the result to the HitBTC exchange instance
     * @param response the orderbook
     */
    private onUpdateOrderbook(response: HitBTCOrderbookResponse): void {
        this.exchange.onUpdateOrderbook(this.mapOrderbook(response));
    }
}
