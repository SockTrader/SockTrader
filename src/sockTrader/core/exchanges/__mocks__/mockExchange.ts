import {CandleProcessor} from "../../types/candleProcessor";
import {ICandle} from "../../types/ICandle";
import {ICandleInterval} from "../../types/ICandleInterval";
import {IConnection} from "../../types/IConnection";
import {IOrderbookData} from "../../types/IOrderbookData";
import {IOrder, OrderSide} from "../../types/order";
import {OrderCreator} from "../../types/orderCreator";
import {Pair} from "../../types/pair";
import BaseExchange from "../baseExchange";

export default class MockExchange extends BaseExchange {

    adjustOrder(order: IOrder, price: number, qty: number): void {
        // ignore
    }

    cancelOrder(order: IOrder): void {
        // ignore
    }

    protected createConnection(): IConnection {
        return {
            send: jest.fn(),
            addRestorable: jest.fn(),
            connect: jest.fn(),
            removeAllListeners: jest.fn(),
        } as any;
    }

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide): void {
        // ignore
    }

    protected loadCurrencies(): void {
        // ignore
    }

    onUpdateCandles(pair: Pair, data: ICandle[], interval: ICandleInterval): void {
        // ignore
    }

    onUpdateOrderbook(data: IOrderbookData): void {
        // ignore
    }

    subscribeCandles(pair: Pair, interval: ICandleInterval): void {
        // ignore
    }

    subscribeOrderbook(pair: Pair): void {
        // ignore
    }

    subscribeReports(): void {
        // ignore
    }

    protected getCandleProcessor(): CandleProcessor {
        throw new Error("Method not implemented.");
    }

    protected getOrderCreator(): OrderCreator {
        throw new Error("Method not implemented.");
    }

}
