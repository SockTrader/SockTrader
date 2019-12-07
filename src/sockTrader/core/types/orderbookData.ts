import {OrderbookEntry} from "../orderbook";
import {Pair} from "./pair";

export interface OrderbookData {
    ask: OrderbookEntry[];
    bid: OrderbookEntry[];
    pair: Pair;
    sequence: number;
}
