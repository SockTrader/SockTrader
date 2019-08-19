import {ICandle} from "../../types/ICandle";
import {ICandleInterval} from "../../types/ICandleInterval";
import {IOrder, OrderSide} from "../../types/order";
import {OrderReportingBehaviour} from "../../types/OrderReportingBehaviour";

// @TODO finish..
export default class PaperTradingReportingBehaviour implements OrderReportingBehaviour {
    adjustOrder(order: IOrder, price: number, qty: number): IOrder | void {
        return undefined;
    }

    cancelOrder(order: IOrder): IOrder | void {
        return undefined;
    }

    createOrder(pair: [string, string], price: number, qty: number, side: OrderSide): IOrder | void {
        return undefined;
    }

    onSnapshotCandles(pair: [string, string], data: ICandle[], interval: ICandleInterval): void {
        // @TODO
    }

    onUpdateCandles(pair: [string, string], data: ICandle[], interval: ICandleInterval): void {
        // @TODO
    }

}
