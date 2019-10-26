import {IOrderbook} from "../../orderbook";

export interface IOrderbookAware {
    onUpdateOrderbook: (orderbook: IOrderbook) => void;
}

export const isOrderbookAware = (plugin: any): plugin is IOrderbookAware => plugin.onUpdateOrderbook !== undefined;
