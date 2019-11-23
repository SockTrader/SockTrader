import Events from "../events";
import {orderLogger} from "../logger";
import {IOrder, OrderStatus, ReportType} from "../types/order";

export default class OrderTracker {

    private readonly unconfirmedOrders: Record<string, boolean> = {};
    private openOrders: IOrder[] = [];

    private setOrderConfirmed(orderId: string) {
        delete this.unconfirmedOrders[orderId];
    }

    private replaceOpenOrder(newOrder: IOrder, oldOrderId: string): IOrder | undefined {
        const oldOrder = this.findOpenOrder(oldOrderId);
        this.setOrderConfirmed(oldOrderId);
        this.removeOpenOrder(oldOrderId);
        this.addOpenOrder(newOrder);

        return oldOrder;
    }

    private addOpenOrder(order: IOrder) {
        this.openOrders.push(order);
    }

    private removeOpenOrder(orderId: string) {
        this.openOrders = this.openOrders.filter(o => o.id !== orderId);
    }

    private findOpenOrder(orderId: string) {
        return this.openOrders.find(openOrder => openOrder.id === orderId);
    }

    private logOpenOrders() {
        const orders = this.openOrders.map(({side, price, quantity}: IOrder) => ({side, price, quantity}));
        orderLogger.info(`Open orders: ${JSON.stringify(orders)}`);
    }

    isOrderUnconfirmed(orderId: string) {
        return this.unconfirmedOrders[orderId] !== undefined;
    }

    setOrderUnconfirmed(orderId: string) {
        this.unconfirmedOrders[orderId] = true;
    }

    getOpenOrders() {
        return this.openOrders;
    }

    setOpenOrders(orders: IOrder[]) {
        this.openOrders = orders;
    }

    /**
     * Processes order depending on the reportType
     * @param order
     */
    process(order: IOrder) {
        const orderId = order.id;
        let oldOrder: IOrder | undefined;

        this.setOrderConfirmed(orderId);

        if (order.reportType === ReportType.REPLACED && order.originalId) {
            oldOrder = this.replaceOpenOrder(order, order.originalId);
        } else if (order.reportType === ReportType.NEW) {
            this.addOpenOrder(order); // New order created
        } else if (order.reportType === ReportType.TRADE && order.status === OrderStatus.FILLED) {
            this.removeOpenOrder(orderId); // Order is 100% filled
        } else if ([ReportType.CANCELED, ReportType.EXPIRED, ReportType.SUSPENDED].indexOf(order.reportType) > -1) {
            this.removeOpenOrder(orderId); // Order is invalid
        }

        this.logOpenOrders();
        Events.emit("core.report", order, oldOrder);
    }
}
