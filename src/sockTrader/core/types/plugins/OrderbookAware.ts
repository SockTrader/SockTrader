import Orderbook from "../../orderbook";

export interface IOrderbookAware {
    onUpdateOrderbook: (orderbook: Orderbook) => void;
}

export const isOrderbookAware = (plugin: any): plugin is IOrderbookAware => plugin.onUpdateOrderbook !== undefined;
