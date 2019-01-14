import {EventEmitter} from "events";
import CandleCollection, {ICandle, ICandleInterval} from "../candleCollection";
import Orderbook from "../orderbook";
import {IOrder, OrderSide} from "../orderInterface";
import {IOrderbookData, ITradeablePair} from "./baseExchange";

export interface IExchange extends EventEmitter {

    isAuthenticated: boolean;
    isCurrenciesLoaded: boolean;

    adjustOrder(order: IOrder, price: number, qty: number): void;

    buy(pair: string, price: number, qty: number): void;

    cancelOrder(order: IOrder): void;

    connect(connectionString?: string): void;

    createOrder(pair: string, price: number, qty: number, side: OrderSide): string;

    destroy(): void;

    getOpenOrders(): IOrder[];

    getOrderbook(pair: string): Orderbook;

    onCreate(): void;

    onCurrenciesLoaded(currencies: ITradeablePair[]): void;

    onReport(data: IOrder): void;

    onUpdateCandles<K extends keyof CandleCollection>(pair: string, data: ICandle[], interval: ICandleInterval, method: Extract<K, "set" | "update">): void;

    onUpdateOrderbook<K extends keyof Orderbook>(data: IOrderbookData, method: Extract<K, "setOrders" | "addIncrement">): void;

    sell(pair: string, price: number, qty: number): void;

    subscribeCandles(pair: string, interval: ICandleInterval): void;

    subscribeOrderbook(pair: string): void;

    subscribeReports(): void;
}
