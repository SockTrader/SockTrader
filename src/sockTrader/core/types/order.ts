import {Moment} from "moment";
import {Pair} from "./pair";

export enum OrderSide {
    BUY = "buy",
    SELL = "sell",
}

export enum OrderStatus {
    NEW = "new",
    SUSPENDED = "suspended",
    CANCELED = "canceled",
    EXPIRED = "expired",
    PARTIALLY_FILLED = "partiallyFilled",
    FILLED = "filled",
}

export enum ReportType {
    NEW = "new",
    SUSPENDED = "suspended",
    CANCELED = "canceled",
    EXPIRED = "expired",
    STATUS = "status",
    TRADE = "trade",
    REPLACED = "replaced",
}

export enum OrderType {
    LIMIT = "limit",
    MARKET = "market",
}

export enum OrderTimeInForce {
    GOOD_TILL_CANCEL = "GTC",
    IMMEDIATE_OR_CANCEL = "IOC",
    FILL_OR_KILL = "FOK",
    DAY = "DAY",
    GOOD_TILL_DATE = "GTD",
}

export interface Order {
    createdAt: Moment;
    id: string;
    originalId?: string;
    pair: Pair;
    price: number;
    quantity: number;
    reportType: ReportType;
    side: OrderSide;
    status: OrderStatus;
    timeInForce: OrderTimeInForce;
    type: OrderType;
    updatedAt: Moment;
}
