import {orderLogger} from "../../loggerFactory";
import {Order, OrderSide, OrderStatus} from "../../types/order";
import Events from "../../events";

export default class ProfitCalculator {

    private remainingAssets = 0;
    private avgBuyPrice = 0;

    constructor() {
        Events.on("core.report", this.onReport.bind(this));
    }

    private getWeightedAverage(quantity: number, price: number) {
        return ((quantity * price) + (this.remainingAssets * this.avgBuyPrice)) / (this.remainingAssets + quantity);
    }

    onReport({side, quantity, price, status}: Order) {
        if ([OrderStatus.FILLED, OrderStatus.PARTIALLY_FILLED].indexOf(status) < 0) return;

        if (side === OrderSide.SELL) {
            if (quantity > this.remainingAssets) return;
            this.remainingAssets -= quantity;

            const abs = price - this.avgBuyPrice;
            const perc = abs / this.avgBuyPrice;

            orderLogger.info({type: "Profit", abs, perc});
        }

        if (side === OrderSide.BUY) {
            this.avgBuyPrice = this.getWeightedAverage(quantity, price);
            this.remainingAssets += quantity;

            orderLogger.info({type: "Avg buy", payload: this.avgBuyPrice});
        }
    }
}
