import {ICandle} from "../../types/ICandle";
import {ICandleInterval} from "../../types/ICandleInterval";
import {IConnection} from "../../types/IConnection";
import {IOrderbookData} from "../../types/IOrderbookData";
import {IOrder, OrderSide} from "../../types/order";
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

    createOrder(pair: [string, string], price: number, qty: number, side: OrderSide): void {
        // ignore
    }

    protected loadCurrencies(): void {
        // ignore
    }

    onUpdateCandles(pair: [string, string], data: ICandle[], interval: ICandleInterval): void {
        // ignore
    }

    onUpdateOrderbook(data: IOrderbookData): void {
        // ignore
    }

    subscribeCandles(pair: [string, string], interval: ICandleInterval): void {
        // ignore
    }

    subscribeOrderbook(pair: [string, string]): void {
        // ignore
    }

    subscribeReports(): void {
        // ignore
    }

}
