export interface HitBTCReportResponse {
    jsonrpc: string;
    method: string;
    params: Array<{
        clientOrderId: string;
        createdAt: string;
        cumQuantity: string;
        id: string;
        originalRequestClientOrderId?: string;
        postOnly: boolean;
        price: string;
        quantity: string;
        reportType: string;
        side: string;
        status: string;
        symbol: string;
        timeInForce: string;
        type: string;
        updatedAt: string;
    }>;
}
