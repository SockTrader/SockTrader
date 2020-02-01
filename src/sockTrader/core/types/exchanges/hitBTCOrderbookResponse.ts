interface HitBTCOrderbookEntry {
    price: string;
    size: string;
}

export interface HitBTCOrderbookResponse {
    jsonrpc: string;
    method: string;
    params: {
        ask: HitBTCOrderbookEntry[];
        bid: HitBTCOrderbookEntry[];
        sequence: number;
        symbol: string;
    };
}
