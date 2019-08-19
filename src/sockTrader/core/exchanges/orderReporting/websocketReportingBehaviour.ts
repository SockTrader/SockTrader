import CandleManager from "../../candles/candleManager";
import {ICandle} from "../../types/ICandle";
import {ICandleInterval} from "../../types/ICandleInterval";
import {IConnection} from "../../types/IConnection";
import {IOrder, OrderSide} from "../../types/order";
import {OrderReportingBehaviour} from "../../types/OrderReportingBehaviour";
import {Pair} from "../../types/pair";
import OrderTracker from "../utils/orderTracker";

export default abstract class WebsocketReportingBehaviour implements OrderReportingBehaviour {

    protected candles: Record<string, CandleManager> = {};

    protected constructor(protected orderTracker: OrderTracker, protected connection: IConnection) {
    }

    abstract cancelOrder(order: IOrder): IOrder | void;

    abstract adjustOrder(order: IOrder, price: number, qty: number): IOrder | void;

    abstract createOrder(pair: [string, string], price: number, qty: number, side: OrderSide): IOrder | void;

    abstract onSnapshotCandles(pair: [string, string], data: ICandle[], interval: ICandleInterval): void;

    abstract onUpdateCandles(pair: [string, string], data: ICandle[], interval: ICandleInterval): void;

    /**
     * Returns candle manager for pair and interval
     * @param {Pair} pair crypto pair (BTC USD/BTC ETH)
     * @param {ICandleInterval} interval time interval
     * @param {(candles: CandleManager) => void} updateHandler what to do if candle collection updates
     * @returns {CandleManager} the candle collection
     */
    getCandleManager(pair: Pair, interval: ICandleInterval, updateHandler: (candles: CandleManager) => void): CandleManager {
        const key = `${pair}_${interval.code}`;
        if (this.candles[key]) {
            return this.candles[key];
        }

        this.candles[key] = new CandleManager(interval);
        this.candles[key].on("update", updateHandler);
        return this.candles[key];
    }
}
