import {IOrder} from "../../types/order";

export default class OrderManager {

    private readonly unconfirmedOrders: Record<string, boolean> = {};
    private openOrders: IOrder[] = [];

    setOrderUnconfirmed(orderId: string) {
        this.unconfirmedOrders[orderId] = true;
    }

    isOrderUnconfirmed(orderId: string) {
        return this.unconfirmedOrders[orderId];
    }

    setOrderConfirmed(orderId: string) {
        delete this.unconfirmedOrders[orderId];
    }

    getOpenOrders() {
        return this.openOrders;
    }

    setOpenOrders(orders: IOrder[]) {
        this.openOrders = orders;
    }

    replaceOpenOrder(newOrder: IOrder, oldOrderId: string): IOrder | undefined {
        const oldOrder = this.findOpenOrder(oldOrderId);
        this.setOrderConfirmed(oldOrderId);
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

    /**
     * Validates if you can adjust an existing order on an exchange
     * @param order the order to check
     * @param price new price
     * @param qty new quantity
     */
    canAdjustOrder(order: IOrder, price: number, qty: number): boolean {
        if (this.isOrderUnconfirmed(order.id)) return false;

        // No need to replace!
        if (order.price === price && order.quantity === qty) return false;

        this.setOrderUnconfirmed(order.id);
        return true;
    }
}
