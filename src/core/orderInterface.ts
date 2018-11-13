export enum OrderSide {
    BUY = "buy",
    SELL = "sell",
}

export enum OrderStatus {
    NEW = "new",
    SUSPENDED = "suspended",
    PARTIALLY_FILLED = "partiallyFilled",
    FILLED = "filled",
    CANCELED = "canceled",
    EXPIRED = "expired",
}

export enum ReportType {
    STATUS = "status",
    NEW = "new",
    CANCELED = "canceled",
    EXPIRED = "expired",
    SUSPENDED = "suspended",
    TRADE = "trade",
    REPLACED = "replaced",
}

export enum OrderType {
    LIMIT = "limit",
    MARKET = "market",
    STOP_LIMIT = "stopLimit",
    STOP_MARKET = "stopMarket",
}

export enum OrderTimeInForce {
    GOOD_TILL_CANCEL = "GTC",
    IMMEDIATE_OR_CANCEL = "IOC",
    FILL_OR_KILL = "FOK",
    DAY = "DAY",
    GOOD_TILL_DATE = "GTD",
}

export interface IOrder {
    clientOrderId: string
    createdAt: Date
    cumQuantity: number
    id: string
    price: number
    quantity: number
    reportType: ReportType
    side: OrderSide
    status: OrderStatus
    symbol: string
    timeInForce: OrderTimeInForce
    type: OrderType
    updatedAt: Date
}
