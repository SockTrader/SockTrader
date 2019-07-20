export interface IHitBTCCandlesResponse {
    jsonrpc: string;
    method: string;
    params: {
        data: Array<{
            close: string;
            max: string;
            min: string;
            open: string;
            timestamp: string;
            volume: string;
            volumeQuote: string;
        }>;
        period: string;
        symbol: string;
    };
}
