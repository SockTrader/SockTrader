import {orderLogger} from "../logger";
import {IOrder, OrderSide, OrderStatus} from "../types/order";
import {IReportAware} from "../types/plugins/IReportAware";

export default class TradeProfitCalculator implements IReportAware {

    private remainingAssets = 0;
    private avgBuyPrice = 0;

    private getWeightedAverage(quantity: number, price: number) {
        return ((quantity * price) + (this.remainingAssets * this.avgBuyPrice)) / (this.remainingAssets + quantity);
    }

    onReport({side, quantity, price, status}: IOrder) {
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
