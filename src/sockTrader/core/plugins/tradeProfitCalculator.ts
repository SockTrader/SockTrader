import {orderLogger} from "../logger";
import {Order, OrderSide, OrderStatus} from "../types/order";
import {ReportAware} from "../types/plugins/ReportAware";

export default class TradeProfitCalculator implements ReportAware {

    private remainingAssets = 0;
    private avgBuyPrice = 0;

    private getWeightedAverage(quantity: number, price: number) {
        return ((quantity * price) + (this.remainingAssets * this.avgBuyPrice)) / (this.remainingAssets + quantity);
    }

    onReport({side, quantity, price, status}: Order) {
        if ([OrderStatus.FILLED, OrderStatus.PARTIALLY_FILLED].indexOf(status) < 0) return;

        if (side === OrderSide.SELL) {
            if (quantity > this.remainingAssets) return;
            this.remainingAssets -= quantity;

            const net = price - this.avgBuyPrice;
            const perc = net / this.avgBuyPrice;

            orderLogger.info(`Profit: ${net} ${perc}`);
        }

        if (side === OrderSide.BUY) {
            this.avgBuyPrice = this.getWeightedAverage(quantity, price);
            this.remainingAssets += quantity;

            orderLogger.info(`Avg buy: ${this.avgBuyPrice}`);
        }
    }
}
