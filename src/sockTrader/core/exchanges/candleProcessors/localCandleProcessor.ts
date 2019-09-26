import Wallet from "../../assets/wallet";
import {CandleProcessor} from "../../types/candleProcessor";
import {ICandle} from "../../types/ICandle";
import {ICandleInterval} from "../../types/ICandleInterval";
import {IOrder, OrderSide, OrderStatus, ReportType} from "../../types/order";
import {Pair} from "../../types/pair";
import BaseExchange from "../baseExchange";
import OrderTracker from "../utils/orderTracker";

export default class LocalCandleProcessor implements CandleProcessor {

    constructor(private readonly orderTracker: OrderTracker, private readonly exchange: BaseExchange, private readonly wallet: Wallet) {
    }

    private isOrderWithinCandle(order: IOrder, candle: ICandle) {
        return ((order.side === OrderSide.BUY && candle.low < order.price) || (order.side === OrderSide.SELL && candle.high > order.price));
    }

    /**
     * Checks if open order can be filled on each price update
     * @param {ICandle} candle the current candle
     */
    private processOpenOrders(candle: ICandle): void {
        const openOrders: IOrder[] = [];

        this.orderTracker.getOpenOrders().forEach((openOrder: IOrder) => {
            if (openOrder.createdAt.isAfter(candle.timestamp)) {
                return openOrders.push(openOrder); // Candle should be newer than order!
            }

            const order = {...openOrder, reportType: ReportType.TRADE, status: OrderStatus.FILLED};

            if (this.isOrderWithinCandle(openOrder, candle)) {
                this.wallet.updateAssets(order);
                return this.exchange.onReport(order);
            }

            openOrders.push(openOrder);
        });
        this.orderTracker.setOpenOrders(openOrders);
    }

    onSnapshotCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void {
        this.onProcessCandles(data);
    }

    onUpdateCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void {
        this.onProcessCandles(data);
    }

    onProcessCandles(data: ICandle[]) {
        this.processOpenOrders(data[0]);
    }
}
