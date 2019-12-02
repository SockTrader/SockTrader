import {IOrderbookEntry} from "../orderbook";
import {Pair} from "./pair";

export interface IOrderbookData {
    ask: IOrderbookEntry[];
    bid: IOrderbookEntry[];
    pair: Pair;
    sequence: number;
}
