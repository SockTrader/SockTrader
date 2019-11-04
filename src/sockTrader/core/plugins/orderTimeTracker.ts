import {orderLogger} from "../logger";
import {IOrder, OrderStatus} from "../types/order";
import {IReportAware} from "../types/plugins/IReportAware";

export default class OrderTimeTracker implements IReportAware {

    private lastOrder = 0;

    private getCurrentTime() {
        return Math.floor(Date.now() / 1000);
    }

    // @TODO Add ability to track multiple orders at the same time.
    onReport({side, status, reportType}: IOrder) {
        if (status === OrderStatus.NEW) {
            this.lastOrder = this.getCurrentTime();
        }

        if ([OrderStatus.PARTIALLY_FILLED, OrderStatus.FILLED].indexOf(status) > -1) {
            orderLogger.info(`Open time: ${this.getCurrentTime() - this.lastOrder}`);
        }
    }
}
