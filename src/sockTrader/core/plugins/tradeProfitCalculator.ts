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
            this.remainingAssets -= quantity;
        }

        if (side === OrderSide.BUY) {
            this.avgBuyPrice = this.getWeightedAverage(quantity, price);
            this.remainingAssets += quantity;
        }

        const avgBuyPrice = this.avgBuyPrice;
        const percentage = (price - this.avgBuyPrice) / this.avgBuyPrice;

        console.log(side, avgBuyPrice, percentage);
    }

}
