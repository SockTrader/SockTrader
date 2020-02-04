import {orderLogger} from "../../loggerFactory";
import {Order, OrderStatus, ReportType} from "../../types/order";
import Events from "../../events";

export default class TimeTracker {

    private orders: Record<string, number> = {};

    constructor() {
        Events.on("core.report", this.onReport.bind(this));
    }

    private getCurrentTime() {
        return Math.floor(Date.now() / 1000);
    }

    onReport({id, originalId, status, reportType}: Order) {
        if (status === OrderStatus.NEW) {
            this.orders[id] = this.getCurrentTime();
        }

        if (reportType === ReportType.REPLACED && originalId) {
            this.orders[id] = this.orders[originalId];
            delete this.orders[originalId];
        }

        if ([OrderStatus.PARTIALLY_FILLED, OrderStatus.FILLED].indexOf(status) > -1) {
            const current = this.orders[id] ? this.getCurrentTime() : 0;
            const prev = this.orders[id] ? this.orders[id] : 0;

            orderLogger.info(`Open time: ${current - prev} ${status}`);
        }

        if ([OrderStatus.CANCELED, OrderStatus.EXPIRED, OrderStatus.SUSPENDED, OrderStatus.FILLED].indexOf(status) > -1) {
            delete this.orders[id];
        }
    }
}
