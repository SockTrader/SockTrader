import {IOrder} from "../../types/order";

export default class OrderManager {

    private readonly processingOrders: Record<string, boolean> = {};
    private openOrders: IOrder[] = [];

    setOrderProcessing(orderId: string) {
        this.processingOrders[orderId] = true;
    }

    isOrderProcessing(orderId: string) {
        return this.processingOrders[orderId];
    }

    removeOrderProcessing(orderId: string) {
        delete this.processingOrders[orderId];
    }

    getOpenOrders() {
        return this.openOrders;
    }

    setOpenOrders(orders: IOrder[]) {
        this.openOrders = orders;
    }

    findAndReplaceOpenOrder(newOrder: IOrder, oldOrderId: string): IOrder | undefined {
        const oldOrder = this.findOpenOrder(oldOrderId);
        this.removeOrderProcessing(oldOrderId);
        this.removeOpenOrder(oldOrderId);
        this.addOpenOrder(newOrder);

        return oldOrder;
    }

    addOpenOrder(order: IOrder) {
        this.openOrders.push(order);
    }

    removeOpenOrder(orderId: string) {
        this.openOrders = this.openOrders.filter(o => o.id !== orderId);
    }

    findOpenOrder(orderId: string) {
        return this.openOrders.find(openOrder => openOrder.id === orderId);
    }
}
