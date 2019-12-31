import {Pair} from "../types/pair";
import Orderbook from "./orderbook";

export default class OrderbookFactory {

    private static readonly orderbooks: Record<string, Orderbook> = {};

    static getInstance(pair: Pair): Orderbook {
        const ticker = pair.join("");
        if (this.orderbooks[ticker]) return this.orderbooks[ticker];

        this.orderbooks[ticker] = new Orderbook(pair);
        return this.orderbooks[ticker];
    }
}
