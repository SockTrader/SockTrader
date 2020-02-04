import {Order, OrderStatus, ReportType} from "../types/order";

export const isReplaced = (order: Order): boolean => ReportType.REPLACED === order.reportType;

export const isNew = (order: Order): boolean => ReportType.NEW === order.reportType;

export const isFilled = (order: Order): boolean => ReportType.TRADE === order.reportType && OrderStatus.FILLED === order.status;

export const isCanceled = (order: Order): boolean => [ReportType.CANCELED, ReportType.EXPIRED, ReportType.SUSPENDED].indexOf(order.reportType) > -1;
