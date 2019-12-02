interface IHitBTCOrderbookEntry {
    price: string;
    size: string;
}

export interface HitBTCOrderbookResponse {
    jsonrpc: string;
    method: string;
    params: {
        ask: IHitBTCOrderbookEntry[],
        bid: IHitBTCOrderbookEntry[],
        sequence: number,
        symbol: string,
    };
}
