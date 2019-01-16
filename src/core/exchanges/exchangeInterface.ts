import {EventEmitter} from "events";
import {Pair} from "../../types/pair";
import CandleCollection, {ICandle, ICandleInterval} from "../candleCollection";
import Orderbook from "../orderbook";
import {IOrder, OrderSide} from "../orderInterface";
import {IOrderbookData, ITradeablePair} from "./baseExchange";

export interface IExchange extends EventEmitter {

    isAuthenticated: boolean;
    isCurrenciesLoaded: boolean;

    adjustOrder(order: IOrder, price: number, qty: number): void;

    buy(pair: Pair, price: number, qty: number): void;

    cancelOrder(order: IOrder): void;

    connect(connectionString?: string): void;

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide): string;

    destroy(): void;

    getOpenOrders(): IOrder[];

    getOrderbook(pair: Pair): Orderbook;

    onCreate(): void;

    onCurrenciesLoaded(currencies: ITradeablePair[]): void;

    onReport(data: IOrder): void;

    onUpdateCandles<K extends keyof CandleCollection>(pair: Pair, data: ICandle[], interval: ICandleInterval, method: Extract<K, "set" | "update">): void;

    onUpdateOrderbook<K extends keyof Orderbook>(data: IOrderbookData, method: Extract<K, "setOrders" | "addIncrement">): void;

    sell(pair: Pair, price: number, qty: number): void;

    subscribeCandles(pair: Pair, interval: ICandleInterval): void;

    subscribeOrderbook(pair: Pair): void;

    subscribeReports(): void;
}
