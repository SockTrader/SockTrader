import moment = require("moment");
import {IOrder, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../sockTrader/core/types/order";

export const FX_FILLED_BUY_ORDER: IOrder = {
    createdAt: moment().subtract(5, "minutes"),
    side: OrderSide.BUY,
    status: OrderStatus.FILLED,
    timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
    type: OrderType.LIMIT,
    updatedAt: moment(),
    reportType: ReportType.TRADE,
    id: "FILLED_BUY_ORDER_1",
    pair: ["BTC", "USD"],
    price: 100,
    quantity: 1,
};

export const FX_NEW_BUY_ORDER: IOrder = {
    createdAt: moment().subtract(5, "minutes"),
    side: OrderSide.BUY,
    status: OrderStatus.NEW,
    timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
    type: OrderType.LIMIT,
    updatedAt: moment(),
    reportType: ReportType.TRADE,
    id: "NEW_BUY_ORDER_1",
    pair: ["BTC", "USD"],
    price: 100,
    quantity: 1,
};
