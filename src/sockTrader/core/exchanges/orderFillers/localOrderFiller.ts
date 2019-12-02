import OrderTracker from "../../order/orderTracker";
import Wallet from "../../plugins/wallet/wallet";
import {Candle} from "../../types/Candle";
import {CandleInterval} from "../../types/CandleInterval";
import {Order, OrderSide, OrderStatus, ReportType} from "../../types/order";
import {OrderFiller} from "../../types/OrderFiller";
import {Pair} from "../../types/pair";

export default class LocalOrderFiller implements OrderFiller {

    constructor(private readonly orderTracker: OrderTracker, private readonly wallet: Wallet) {
    }

    private isOrderWithinCandle(order: Order, candle: Candle) {
        return ((order.side === OrderSide.BUY && candle.low < order.price) || (order.side === OrderSide.SELL && candle.high > order.price));
    }

    /**
     * Checks if open order can be filled on each price update
     * @param {Candle} candle the current candle
     */
    private processOpenOrders(candle: Candle): void {
        const openOrders: Order[] = [];

        this.orderTracker.getOpenOrders().forEach((openOrder: Order) => {
            if (openOrder.createdAt.isAfter(candle.timestamp)) {
                return openOrders.push(openOrder); // Candle should be newer than order!
            }

            const order = {...openOrder, reportType: ReportType.TRADE, status: OrderStatus.FILLED};

            if (this.isOrderWithinCandle(openOrder, candle)) {
                this.wallet.updateAssets(order);
                return this.orderTracker.process(order);
            }

            openOrders.push(openOrder);
        });
        this.orderTracker.setOpenOrders(openOrders);
    }

    onSnapshotCandles(pair: Pair, data: Candle[], interval: CandleInterval): void {
        this.onProcessCandles(data);
    }

    onUpdateCandles(pair: Pair, data: Candle[], interval: CandleInterval): void {
        this.onProcessCandles(data);
    }

    onProcessCandles(data: Candle[]) {
        this.processOpenOrders(data[0]);
    }
}
