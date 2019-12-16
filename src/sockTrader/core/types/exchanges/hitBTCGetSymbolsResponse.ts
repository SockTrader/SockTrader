export interface HitBTCGetSymbolsResponse {
    id: string;
    jsonrpc: string;
    result: Array<{
        baseCurrency: string;
        feeCurrency: string;
        id: string;
        provideLiquidityRate: string;
        quantityIncrement: string;
        quoteCurrency: string;
        takeLiquidityRate: string;
        tickSize: string;
    }>;
}
