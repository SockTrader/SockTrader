import {ICandle} from "../candleCollection";
import {IExchange} from "../exchanges/exchangeInterface";
import {IOrderbook} from "../orderbook";
import BaseStrategy, {IStrategyClass} from "./baseStrategy";

export default <T extends BaseStrategy>(Strategy: IStrategyClass<T>) => {
    const captureEvents = ["app.adjustOrder", "app.signal", "app.signal"];
    return class BackTest extends (Strategy as IStrategyClass<BaseStrategy>) {

        constructor(public pair: string, public exchange: IExchange) {
            super(pair, exchange);
        }

        emit(event: string | symbol, ...args: any[]): boolean {
            if (captureEvents.indexOf(event.toString()) >= 0) {
                console.log("Event captured", event);
                return false;
            }

            return super.emit(event, ...args);
        }

        notifyOrder(data: any): void {
            super.notifyOrder(data);
        }

        updateCandles(candles: ICandle[]): void {
            console.log("Candles captured");
            super.updateCandles(candles);
        }

        updateOrderbook(orderBook: IOrderbook): void {
            console.log("Orderbook update captured");
            super.updateOrderbook(orderBook);
        }
    };
};
