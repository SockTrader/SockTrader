import Orderbook from "../../orderbook/orderbook";

export interface OrderbookAware {
    onUpdateOrderbook: (orderbook: Orderbook) => void;
}

export const isOrderbookAware = (plugin: any): plugin is OrderbookAware => plugin.onUpdateOrderbook !== undefined;
