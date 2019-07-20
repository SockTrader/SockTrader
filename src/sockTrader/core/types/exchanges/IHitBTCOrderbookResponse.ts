import {IOrderbookEntry} from "../../orderbook";

export interface IHitBTCOrderbookResponse {
    jsonrpc: string;
    method: string;
    params: {
        ask: IOrderbookEntry[],
        bid: IOrderbookEntry[],
        sequence: number,
        symbol: string,
    };
}
